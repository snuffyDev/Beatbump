mod hls;

use async_recursion::async_recursion;
use hls::body::modify_hls_body;

use hyper::header::{self};
use hyper::server::conn::Http;
use hyper::service::service_fn;
use hyper::{Body, Request};
use hyper::{Client, Method, Response, StatusCode};
use hyper_tls::HttpsConnector;
use std::net::SocketAddr;

use tokio::net::TcpListener;

use std::collections::HashMap;
use std::time::Duration;
use url::form_urlencoded;

// Todo: implement this
static ALLOWED_HOSTS: [&str; 2] = ["googlevideo.com", "googleusercontent.com"];

// Todo: implement this
static HEADER_BLACKLIST: [&str; 7] = [
    "Accept-Encoding",
    "Authorization",
    "Origin",
    "Referer",
    "Cookie",
    "Set-Cookie",
    "Etag",
];

enum ResponseResult {
    Ok(Response<Body>),
    Err(String),
}
// Sends a HTTP request
#[async_recursion]
async fn send_request(url: &str, host: &str) -> ResponseResult {
    let https = HttpsConnector::new();
    let req_url = &url;

    let client = Client::builder()
        .pool_max_idle_per_host(0)
        .http1_title_case_headers(true)
        .http1_preserve_header_case(true)
        .http2_keep_alive_timeout(Duration::new(20, 0))
        .build::<_, Body>(https);

    let req = Request::builder()
        .uri(req_url.parse::<hyper::Uri>().expect("Error parsing Uri"))
        .method("GET")
        .header("Origin", format!("https://{}", &host))
        .body(Body::empty());

    let request = match req {
        Ok(req) => req,
        Err(e) => return ResponseResult::Err(e.to_string()),
    };

    match client.request(request).await {
        Ok(res) => {
            if let Some(location_header) = res.headers().get(header::LOCATION) {
                return send_request(&location_header.to_str().unwrap(), host).await;
            }
            ResponseResult::Ok(res)
        }
        Err(e) => return ResponseResult::Err(e.to_string()),
    }
}

async fn handle_request(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let mut response = Response::new(Body::empty());

    response.headers_mut().insert(
        hyper::header::ACCESS_CONTROL_ALLOW_ORIGIN,
        "*".parse::<hyper::http::HeaderValue>().unwrap(),
    );

    let path = req.uri().path_and_query().unwrap().path().to_string(); // Split the URL Path by "/", and returns each str slice
    let parts: Vec<&str> = path.split("/").collect();

    let query = req
        .uri()
        .path_and_query()
        .unwrap()
        .query()
        .unwrap_or("host=none");

    // Collect all the URL Search Params into a HashMap
    let query_map = form_urlencoded::parse(query.as_bytes())
        .into_owned()
        .collect::<HashMap<String, String>>();

    // Get the URL Search Param `&host=`
    let host = query_map.get("host").unwrap().as_str();

    // Matches Request Method and the first URL Path section
    match (req.method(), parts[1]) {
        (&Method::GET, "videoplayback") => {
            if &host == &"none" {
                return Ok(response);
            }
            let url = format!("https://{}{}?{}", &host, &path, &query).to_string();

            let mut result = match send_request(&url, &host).await {
                ResponseResult::Ok(r) => r,
                ResponseResult::Err(e) => Response::builder().status(500).body(e.into()).unwrap(),
            };

            result.headers_mut().insert(
                hyper::header::ACCESS_CONTROL_ALLOW_ORIGIN,
                "*".parse::<hyper::http::HeaderValue>().unwrap(),
            );

            Ok(result)
        }
        (&Method::GET, "api") => {
            if &host == &"none" {
                return Ok(response);
            }
            let url = format!("https://manifest.googlevideo.com{}", &req.uri().path());

            let result = match send_request(&url, &host).await {
                ResponseResult::Ok(r) => r,
                ResponseResult::Err(e) => response,
            };
            // Collect the inital Response body into bytes,
            // Then turn it into a string
            let body = hyper::body::to_bytes(result.into_body())
                .await
                .unwrap_or_default();
            let body_str = String::from_utf8(body.to_vec()).unwrap();

            // Modify the HLS Manifest body
            let result = modify_hls_body(body_str, host)
                .await
                .expect("Could not modify HLS body.");

            // Build a new Response with the modified HLS Manifest
            let result_response = Response::builder()
                .header("Access-Control-Allow-Origin", "*")
                .body(result.into())
                .unwrap();

            Ok(result_response)
        }
        (&Method::GET, "status") => {
            *response.status_mut() = StatusCode::OK;
            Ok(response)
        }
        _ => {
            *response.status_mut() = StatusCode::NOT_FOUND;
            Ok(response)
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr: SocketAddr = "0.0.0.0:10000".parse().unwrap();

    let listener = TcpListener::bind(&addr).await?;

    println!("Server Listening on {}", addr);

    loop {
        let (stream, _) = listener.accept().await?;

        tokio::task::spawn(async move {
            let service = service_fn(move |req| handle_request(req));

            if let Err(err) = Http::new()
                .http2_keep_alive_timeout(Duration::new(30, 0))
                .http1_preserve_header_case(true)
                .http1_title_case_headers(true)
                .serve_connection(stream, service)
                .await
            {
                println!("Failed to serve connection: {:?}", err);
            }
        });
    }
}

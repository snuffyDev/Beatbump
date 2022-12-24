mod hls;

use async_recursion::async_recursion;
use hls::body::modify_hls_body;

use hyper::client::HttpConnector;
use hyper::header::{self};
use hyper::server::conn::Http;
use hyper::service::service_fn;
use hyper::{Body, Request};
use hyper::{Client, Method, Response, StatusCode};
use hyper_tls::HttpsConnector;
use lazy_static::lazy_static;
use std::net::SocketAddr;

use tokio::net::TcpListener;

use std::collections::HashMap;
use std::time::Duration;
use url::form_urlencoded;

// // Todo: implement this
// static ALLOWED_HOSTS: [&str; 2] = ["googlevideo.com", "googleusercontent.com"];

// // Todo: implement this
// static HEADER_BLACKLIST: [&str; 7] = [
//     "Accept-Encoding",
//     "Authorization",
//     "Origin",
//     "Referer",
//     "Cookie",
//     "Set-Cookie",
//     "Etag",
// ];

enum ResponseResult {
    Ok(Response<Body>),
    Err(String),
}

lazy_static! {
    static ref HTTPS: HttpsConnector<HttpConnector> = HttpsConnector::new();
    static ref HTTP_CLIENT: Client<HttpsConnector<HttpConnector>> = Client::builder()
        .pool_max_idle_per_host(0)
        .pool_idle_timeout(std::time::Duration::from_millis(0))
        .pool_max_idle_per_host(0)
        .http1_title_case_headers(true)
        .http1_preserve_header_case(true)
        .http2_keep_alive_timeout(Duration::new(20, 0))
        .build::<_, Body>(HTTPS.to_owned());
}

// Sends a HTTP request
#[async_recursion]
async fn send_request(url: &str, host: &str) -> ResponseResult {
    let req_url = &url;

    let req = Request::builder()
        .uri(req_url.to_string())
        .method("GET").header("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
        .header("Origin", format!("https://{}", &host))
        .body(Body::empty());

    let request = match req {
        Ok(req) => req,
        Err(e) => return ResponseResult::Err(e.to_string()),
    };

    match HTTP_CLIENT.request(request).await {
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

    let path = req.uri().path().to_string();
    let first_path_part = path.splitn(3, "/").nth(1).unwrap_or(""); // Split the URL Path by "/", up to 3 "/"'s, return index 1
    let query = req.uri().query().unwrap_or("host=none");

    // Collect all the URL Search Params into a HashMap
    let query_map = form_urlencoded::parse(query.as_bytes())
        .into_owned()
        .collect::<HashMap<String, String>>();

    // Get the URL Search Param `&host=`
    let host = query_map.get("host").unwrap();

    // Matches Request Method and the first URL Path section
    match (req.method(), first_path_part) {
        (&Method::GET, "videoplayback") => {
            let url = format!("https://{}{}?{}", &host, &path, &query);

            match send_request(&url, &host).await {
                ResponseResult::Ok(mut r) => {
                    r.headers_mut().insert(
                        hyper::header::ACCESS_CONTROL_ALLOW_ORIGIN,
                        "*".parse::<hyper::http::HeaderValue>().unwrap(),
                    );
                    Ok(r)
                }
                ResponseResult::Err(e) => {
                    Ok(Response::builder().status(500).body(e.into()).unwrap())
                }
            }
        }
        (&Method::GET, "api") => {
            let url = format!("https://manifest.googlevideo.com{}", &path);

            let result = match send_request(&url, &host).await {
                ResponseResult::Ok(r) => r,
                ResponseResult::Err(e) => Response::new(e.into()),
            };
            // Collect the inital Response body into bytes,
            // Then turn it into a string
            let body = hyper::body::to_bytes(result.into_body())
                .await
                .unwrap_or_default()
                .to_vec();
            let body_str = unsafe { String::from_utf8_unchecked(body) };
            // Modify the HLS Manifest body
            let result = modify_hls_body(body_str, &host)
                .await
                .expect("Could not modify HLS body.");

            // Build a new Response with the modified HLS Manifest
            *response.body_mut() = result.into();

            Ok(response)
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
                .http2_keep_alive_interval(Duration::new(20, 0))
                .http2_keep_alive_timeout(Duration::new(20, 0))
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

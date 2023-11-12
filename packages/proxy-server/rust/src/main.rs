mod client;
mod hls;

use hls::body::modify_hls_body;

use client::{HttpClient, HttpClientError};
use hyper::server::conn::Http;
use hyper::service::service_fn;
use hyper::{Body, Request};
use hyper::{Method, Response, StatusCode};
use std::net::SocketAddr;
use tokio::net::TcpListener;

use std::collections::HashMap;
use std::time::Duration;
use url::form_urlencoded;

async fn handle_request(req: Request<Body>) -> Result<Response<Body>, HttpClientError> {
    let mut response = Response::new(Body::empty());
    let client = HttpClient::new();

    response.headers_mut().insert(
        hyper::header::ACCESS_CONTROL_ALLOW_ORIGIN,
        "*".parse::<hyper::http::HeaderValue>().unwrap(),
    );

    let path = req.uri().path().to_string();
    // Split the URL Path by "/", return the first pathname (e.g. "videoplayback")
    let first_path_part = path.split("/").collect::<Vec<&str>>()[1];

    let query = req.uri().query().unwrap_or("host=none");

    // Collect all the URL Search Params into a HashMap
    let query_map = form_urlencoded::parse(query.as_bytes())
        .into_owned()
        .collect::<HashMap<String, String>>();

    // Get the URL Search Param `&host=`
    let host = query_map.get("host").unwrap();

    // Matches Request Method and the first URL Path section
    match (req.method(), first_path_part) {
        (&Method::GET, "videoplayback") => handle_videoplayback(&client, &host, &path, &query)
            .await
            .map_or_else(
                |e| {
                    println!("Error: {}", e);
                    Ok(Response::new(Body::from(e.to_string())))
                },
                |r| {
                    *response.body_mut() = r;
                    Ok(response)
                },
            ),
        (&Method::GET, "api") => {
            let result = handle_hls(&client, &host, &path).await.unwrap();

            // Build a new Response with the modified HLS Manifest
            *response.body_mut() = result;

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

async fn handle_videoplayback(
    client: &HttpClient,
    host: &str,
    path: &str,
    query: &str,
) -> Result<Body, HttpClientError> {
    let url = format!("https://{}{}?{}", host, path, query);
    Ok(client
        .get(&url, &host)
        .await
        .unwrap_or_default()
        .into_body())
}

async fn handle_hls(client: &HttpClient, host: &str, path: &str) -> Result<Body, HttpClientError> {
    let url = format!("https://manifest.googlevideo.com{}", &path);

    let mut result = client.get(&url, &host).await.unwrap_or_default();
    let body = result.body_mut();

    let body = hyper::body::to_bytes(body).await.unwrap_or_default();
    let body_str = String::from_utf8(body.to_vec()).unwrap_or_default();

    // Modify the HLS Manifest and return it as a Body
    Ok(Body::from(
        modify_hls_body(body_str, &host)
            .await
            .expect("Could not modify HLS body."),
    ))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let bind: String = std::env::var("PROXY_ADDR").unwrap_or("0.0.0.0".to_string());
    let port: String = std::env::var("PROXY_PORT").unwrap_or("3001".to_string());
    let addr: SocketAddr = format!("{}:{}", &bind, &port).parse().unwrap();

    let listener = TcpListener::bind(&addr).await?;

    println!("Server Listening on {}", addr);

    loop {
        let (stream, _) = listener.accept().await?;

        tokio::task::spawn(async move {
            println!("New Connection {}", stream.peer_addr().unwrap());
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

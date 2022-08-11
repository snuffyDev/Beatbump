mod hls;

use hls::modify_hls_body;

use hyper::body::{self};
use hyper::server::conn::Http;
use hyper::service::service_fn;
use hyper::{Body, Request};
use hyper::{Client, Method, Response, StatusCode, Uri};
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

// Sends a HTTP request
async fn send_request(uri_path: &str, host: &str) -> Result<Response<Body>, hyper::Error> {
    let https = HttpsConnector::new();
    let url = format!("https://{}{}", host, uri_path)
        .parse::<Uri>()
        .unwrap();
    let host = url.host().expect("uri has no host");

    let client = Client::builder()
        .pool_max_idle_per_host(0)
        .http1_title_case_headers(true)
        .http1_preserve_header_case(true)
        .http2_keep_alive_interval(Duration::new(20, 0))
        .build::<_, Body>(https);

    let req = Request::builder()
        .uri(url)
        .method("GET")
        .header(
            "Origin",
            format!("{}://{}", url.scheme_str().unwrap(), host),
        )
        .body(Body::empty())
        .map_err(|err| {
            println!("{}", err.to_string());
            err.to_string()
        })
        .unwrap();

    let res = client.request(req).await?;
		if res.headers().contains_key("Location") {
			send_request()
		};
    Ok(Response::new(res.into_body()))
}

async fn handle_request(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let mut response = Response::new(Body::empty());

    let path = req.uri().path();
    let parts: Vec<&str> = path.split("/").collect();
    let query = if let Some(q) = req.uri().query() {
        q
    } else {
        ""
    };
    let query_map = form_urlencoded::parse(query.as_bytes())
        .into_owned()
        .collect::<HashMap<String, String>>();
    let host = if let Some(h) = query_map.get("host") {
        h.as_str()
    } else {
        return Ok(Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .body("No host parameter provided".into())
            .unwrap());
    };
    match (req.method(), parts[1]) {
        (&Method::GET, "videoplayback") => Ok(send_request(path, &host).await?),
        (&Method::GET, "api") => {
            let res = send_request(path, "manifest.googlevideo.com").await?;
            let body = body::to_bytes(res.into_body()).await?.clone();
            let body_str = String::from_utf8(body.to_vec()).unwrap();
            let result = modify_hls_body(&body_str, &host).await.unwrap();

            let result_response = Response::builder().body(result.into()).unwrap();

            Ok(result_response)
        }
        _ => {
            *response.status_mut() = StatusCode::NOT_FOUND;
            Ok(response)
        }
    }
}

#[tokio::main]
pub async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr: SocketAddr = "127.0.0.1:33125".parse().unwrap();

    let listener = TcpListener::bind(&addr).await?;

    println!("Server Listening on {}", addr);

    loop {
        let (stream, _) = listener.accept().await?;

        tokio::task::spawn(async move {
            let service = service_fn(move |req| handle_request(req));

            if let Err(err) = Http::new()
                .http2_keep_alive_interval(Duration::new(20, 0))
                .http1_preserve_header_case(true)
                .http1_title_case_headers(true)
                .http2_enable_connect_protocol()
                .serve_connection(stream, service)
                .await
            {
                println!("Failed to serve connection: {:?}", err);
            }
        });
    }
}

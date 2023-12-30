use hyper::client::HttpConnector;
use hyper::http::uri::InvalidUri;
use hyper::{Body, Client, Method, Request, Response, Uri};
use hyper_tls::HttpsConnector;
use std::error::Error;
use std::fmt::{self, Display, Formatter};
use std::time::Duration;

const USER_AGENT: &str = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
#[derive(Debug)]
pub enum HttpClientError {
    Hyper(hyper::Error),
    Uri(InvalidUri),
    Http(hyper::http::Error),
}

impl Display for HttpClientError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            HttpClientError::Hyper(e) => write!(f, "Hyper error: {}", e),
            HttpClientError::Uri(e) => write!(f, "URI error: {}", e),
            HttpClientError::Http(e) => write!(f, "HTTP error: {}", e),
        }
    }
}

impl Error for HttpClientError {}

impl From<hyper::Error> for HttpClientError {
    fn from(err: hyper::Error) -> HttpClientError {
        println!("Error: {}", err);
        HttpClientError::Hyper(err)
    }
}

impl From<InvalidUri> for HttpClientError {
    fn from(err: InvalidUri) -> HttpClientError {
        println!("Error: {}", err);
        HttpClientError::Uri(err)
    }
}

impl From<hyper::http::Error> for HttpClientError {
    fn from(err: hyper::http::Error) -> HttpClientError {
        println!("Error: {}", err);
        HttpClientError::Http(err)
    }
}

pub struct HttpClient {
    client: Client<HttpsConnector<HttpConnector>>,
}

impl HttpClient {
    pub fn new() -> Self {
        let https = HttpsConnector::new();
        let client = Client::builder()
            .pool_max_idle_per_host(0)
            .pool_idle_timeout(Duration::from_millis(0))
            .http1_title_case_headers(true)
            .http1_preserve_header_case(true)
            .http2_keep_alive_timeout(Duration::new(20, 0))
            .build::<_, Body>(https);

        HttpClient { client }
    }

    pub async fn get(&self, url: &str, origin: &str) -> Result<Response<Body>, HttpClientError> {
        let uri = url.parse::<Uri>().map_err(HttpClientError::from)?;
        let req = Request::builder()
            .method(Method::GET)
            .header("Origin", &origin.to_string())
            .header("User-Agent", USER_AGENT)
            .uri(uri)
            .body(Body::empty())
            .map_err(HttpClientError::from)?;

        let response = self
            .client
            .request(req)
            .await
            .map_err(HttpClientError::from);
        // if response has a location header, then we need to make another request
        // to that location
        match response {
            Ok(response) => {
                if response.headers().contains_key("Location") {
                    return self.handle_redirect(response, origin).await;
                }
                return Ok(response);
            }
            Err(e) => Err(e),
        }
    }

    async fn handle_redirect(
        &self,
        response: Response<Body>,
        origin: &str,
    ) -> Result<Response<Body>, HttpClientError> {
        if response.headers().contains_key("Location") {
            let location = response
                .headers()
                .get("Location")
                .unwrap()
                .to_str()
                .unwrap();
            let uri = location.parse::<Uri>().map_err(HttpClientError::from)?;
            let req = Request::builder()
                .method(Method::GET)
                .header("Origin", &origin.to_string())
                .header("User-Agent", USER_AGENT)
                .uri(uri)
                .body(Body::empty())
                .map_err(HttpClientError::from)?;
            let response = self
                .client
                .request(req)
                .await
                .map_err(HttpClientError::from);
            return response;
        }
        return Ok(response);
    }
}

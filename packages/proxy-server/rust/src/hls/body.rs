use lazy_static::lazy_static;
use regex::{Captures, Regex};

lazy_static! {
    static ref RE_URL: Regex = Regex::new(r"https://(.*?)/").unwrap();
    static ref RE_PATH: Regex = Regex::new("(/(?:api|videoplayback)(?:.[^\"\n]+))").unwrap();
    static ref RE_XMAP: Regex = Regex::new("(#EXT-X-MAP:URI=\".*?)(?:?)(host=.*\")").unwrap();
}

pub async fn modify_hls_body(body: String, host_url: &str) -> Result<String, ()> {
    let body_relative_urls = RE_URL.replace_all(&body, "/");
    let body_add_host = RE_PATH.replace_all(&body_relative_urls, |caps: &Captures| {
        format!("{}?host={}", &caps[1], host_url)
    });

    if body_add_host.contains("#EXT-X-MAP:URI=\"") {
        let body_fix_query = RE_XMAP.replace_all(&body_add_host, |caps: &Captures| {
            format!("{}&{}", &caps[1], &caps[2])
        });
        return Ok(body_fix_query.to_string());
    }
    Ok(body_add_host.to_string())
}

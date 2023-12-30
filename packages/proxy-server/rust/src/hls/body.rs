use regex::Regex;
use url::Url;

pub fn modify_hls_body(body: String, host_url: &str) -> Result<String, ()> {
    let re_path: Regex = Regex::new("(https?://.+?/(?:api|videoplayback)/.+[^\"|\n])").unwrap();

    let mut modified_body = String::new();
    let mut last_index = 0;

    for capture in re_path.captures_iter(&body) {
        let path = &capture[1];
        let url = Url::parse(path).map_err(|_| ())?;

        let mut query_pairs = url
            .query_pairs()
            .into_iter()
            .filter(|(k, _)| k.ne("host"))
            .collect::<Vec<_>>();

        query_pairs.push(("host".into(), host_url.into()));

        let new_query = query_pairs
            .into_iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect::<Vec<_>>()
            .join("&");
        let modified_path = format!("{}?{}", url.path(), new_query);

        modified_body.push_str(&body[last_index..capture.get(1).unwrap().start()]);
        modified_body.push_str(&modified_path);
        last_index = capture.get(1).unwrap().end();
    }

    modified_body.push_str(&body[last_index..]);

    Ok(modified_body)
}

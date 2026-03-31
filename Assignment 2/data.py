graph = {
    "arxiv.org":         ["nature.com", "pubmed.gov", "openai.com", "deepmind.com"],
    "nature.com":        ["arxiv.org", "pubmed.gov", "bbc.com"],
    "pubmed.gov":        ["nature.com", "arxiv.org"],
    "openai.com":        ["arxiv.org", "github.com", "huggingface.co"],
    "deepmind.com":      ["arxiv.org", "nature.com", "github.com"],
    "huggingface.co":    ["arxiv.org", "github.com", "openai.com"],
    "github.com":        ["stackoverflow.com", "huggingface.co"],
    "stackoverflow.com": ["github.com"],
    "bbc.com":           ["nature.com", "reuters.com"],
    "reuters.com":       ["bbc.com"],
    "spamsite.com":      ["openai.com", "arxiv.org"],
    "blog123.com":       ["spamsite.com", "blog123.com"]
}

robots_txt_data = {
    "arxiv.org": """
        User-agent: GPTBot
        Allow: /abs/
        Allow: /pdf/
        Disallow: /user/
    """,
    "nature.com": """
        User-agent: GPTBot
        Disallow: /
    """,
    "pubmed.gov": """
        User-agent: *
        Allow: /
    """,
    "openai.com": """
        User-agent: GPTBot
        Allow: /research/
        Allow: /blog/
        Disallow: /admin/
    """,
    "deepmind.com": """
        User-agent: GPTBot
        Allow: /
    """,
    "huggingface.co": """
        User-agent: GPTBot
        Allow: /
    """,
    "github.com": """
        User-agent: GPTBot
        Allow: /
        Disallow: /private/
    """,
    "stackoverflow.com": """
        User-agent: GPTBot
        Allow: /questions/
        Disallow: /users/
    """,
    "bbc.com": """
        User-agent: GPTBot
        Disallow: /
    """,
    "reuters.com": """
        User-agent: GPTBot
        Allow: /
    """,
    "spamsite.com": """
        User-agent: *
        Disallow: /
    """,
    "blog123.com": """
        User-agent: *
        Disallow: /
    """
}
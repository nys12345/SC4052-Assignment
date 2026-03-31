import urllib.robotparser
from data import graph, robots_txt_data

def is_allowed(url, robots_txt_content, user_agent="GPTBot"):
    rp = urllib.robotparser.RobotFileParser()
    # Feed the simulated robots.txt content as if fetched from the web
    rp.parse(robots_txt_content.strip().splitlines())
    return rp.can_fetch(user_agent, "https://" + url)

def web_crawl_priority(graph, pagerank_scores, robots_txt_data, k):

    allowed_urls = {}
    blocked_urls = []

    for url, score in pagerank_scores.items():
        robots_content = robots_txt_data.get(url, "User-agent: *\nAllow: /")
        
        if is_allowed(url, robots_content):
            allowed_urls[url] = score
            print(f"  [ALLOWED]  {url} (PR: {score:.4f})")
        else:
            blocked_urls.append(url)
            print(f"  [BLOCKED]  {url} — robots.txt disallows GPTBot")

    print(f"\nBlocked {len(blocked_urls)} URLs. Ranking {len(allowed_urls)} allowed URLs...\n")

    # Rank by PageRank
    ranked = sorted(allowed_urls.items(), key=lambda x: x[1], reverse=True)

    print(f"Top 5 URLs to Crawl:\n")
    for rank, (url, score) in enumerate(ranked[:5], start=1):
        outlinks = graph.get(url, [])
        print(f"  {rank}. {url}")
        print(f"     PageRank : {score:.4f}")
        print(f"     Outlinks : {outlinks}")
        print()

    return [url for url, _ in ranked[:k]]

def compute_pagerank(graph, b=0.85, max_iter=100, tol=1e-6):
    nodes = list(graph.keys())
    N = len(nodes)
    pr = {node: 1 / N for node in nodes}

    for i in range(max_iter):
        new_pr = {}
        for node in nodes:
            rank_sum = 0
            for other in nodes:
                if node in graph.get(other, []):
                    out_degree = len(graph[other])
                    rank_sum += pr[other] / out_degree
            new_pr[node] = (1 - b) / N + b * rank_sum

        # Check convergence
        diff = sum(abs(new_pr[n] - pr[n]) for n in nodes)
        pr = new_pr
        if diff < tol:
            print(f"Converged after {i + 1} iterations")
            break

    return pr

pagerank_scores = compute_pagerank(graph)

for url, score in sorted(pagerank_scores.items(), key=lambda x: x[1], reverse=True):
    print(f"  {url:25s} {score:.6f}")
print()

k = len(pagerank_scores)
result = web_crawl_priority(graph, pagerank_scores, robots_txt_data, k)
print("Final crawl list:", result)

def compute_filtered_pagerank(graph, robots_txt_data, b=0.85, max_iter=100, tol=1e-6):
    # Filter graph to only include allowed sites
    allowed_sites = [
        url for url in graph
        if is_allowed(url, robots_txt_data.get(url, "User-agent: *\nAllow: /"))
    ]

    # Rebuild graph with only allowed nodes and allowed outlinks
    filtered_graph = {}
    for url in allowed_sites:
        filtered_graph[url] = [
            link for link in graph[url] if link in allowed_sites
        ]

    nodes = list(filtered_graph.keys())
    N = len(nodes)
    pr = {node: 1 / N for node in nodes}

    for i in range(max_iter):
        new_pr = {}
        for node in nodes:
            rank_sum = 0
            for other in nodes:
                if node in filtered_graph.get(other, []):
                    out_degree = len(filtered_graph[other])
                    if out_degree > 0:
                        rank_sum += pr[other] / out_degree
            new_pr[node] = (1 - b) / N + b * rank_sum

        diff = sum(abs(new_pr[n] - pr[n]) for n in nodes)
        pr = new_pr
        if diff < tol:
            print(f"Converged after {i + 1} iterations")
            break

    return pr, filtered_graph

filtered_scores, filtered_graph = compute_filtered_pagerank(graph, robots_txt_data)

print("Filtered PageRank (allowed sites only):\n")
for url, score in sorted(filtered_scores.items(), key=lambda x: x[1], reverse=True):
    print(f"  {url:25s} {score:.6f}  Outlinks: {filtered_graph[url]}")
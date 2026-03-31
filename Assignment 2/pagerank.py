import numpy as np
from collections import defaultdict
import matplotlib.pyplot as plt
from scipy import sparse
from scipy.sparse.linalg import spsolve

def load_graph(filepath):
    out_edges = defaultdict(list)
    in_edges  = defaultdict(list)
    nodes = set()
    with open(filepath, 'r') as f:
        for line in f:
            if line.startswith('#'):
                continue
            u, v = map(int, line.split())
            out_edges[u].append(v)
            in_edges[v].append(u)
            nodes.update([u, v])
    return nodes, out_edges, in_edges

# recursively remove dead-end and return removal order
def remove_dead_ends(nodes, out_edges, in_edges):
    working_nodes = set(nodes)
    working_out = {n: set(out_edges[n]) for n in nodes}
    working_in  = {n: set(in_edges[n])  for n in nodes}

    removal_order = []
    changed = True
    while changed:
        changed = False
        dead_ends = [n for n in working_nodes if len(working_out[n]) == 0]
        for n in dead_ends:
            removal_order.append(n)
            working_nodes.remove(n)
            for v in working_in[n]:
                working_out[v].discard(n)
            changed = True

    print(f"Removed {len(removal_order)} dead-end nodes. Remaining Np={len(working_nodes)}.")
    return working_nodes, working_out, working_in, removal_order

# convergence for 10k with tolerance of 1e-6, 10 iteration for 100k
def pagerank(working_nodes, working_in, working_out, N, beta=0.85, T=10, tol=None):
    Np = len(working_nodes)
    PR = {n: 1.0 / Np for n in working_nodes}
    diffs = []

    max_iter = T if tol is None else 1000
    for t in range(max_iter):
        new_PR = {}
        for u in working_nodes:
            rank = (1 - beta) / N
            for v in working_in[u]:
                if v in working_nodes:
                    rank += beta * PR[v] / len(working_out[v])
            new_PR[u] = rank

        if tol is not None:
            diff = sum(abs(new_PR[n] - PR[n]) for n in working_nodes)
            diffs.append(diff)
            print(f"  Iteration {t+1}, Rank score diff = {diff:.10f}")
            if diff < tol:
                print(f"  Converged after {t+1} iterations.")
                PR = new_PR
                break
        else:
            print(f"  Iteration {t+1} done.")

        PR = new_PR

    return PR, diffs

# restore dead-ends in reverse order of removal
def restore_dead_ends(PR, removal_order, in_edges, working_out, N, beta=0.85):
    for n in reversed(removal_order):
        rank = (1 - beta) / N
        for v in in_edges[n]:
            if v in PR and len(working_out.get(v, [])) > 0:
                rank += beta * PR[v] / len(working_out[v])
        PR[n] = rank
    return PR


def run_pagerank(nodes, out_edges, in_edges, beta=0.85, T=10, tol=None):
    N = len(nodes)
    working_nodes, working_out, working_in, removal_order = remove_dead_ends(
        nodes, out_edges, in_edges)
    PR, diffs = pagerank(working_nodes, working_in, working_out, N, beta, T, tol)
    PR = restore_dead_ends(PR, removal_order, in_edges, out_edges, N, beta)
    return PR, diffs

# web-Google_10k.txt
filepath = "Assignment 2/web-Google_10k.txt"
print(f"Dataset: {filepath}")
nodes, out_edges, in_edges = load_graph(filepath)
print(f"Total nodes: {len(nodes)}")
PR, diffs = run_pagerank(nodes, out_edges, in_edges, beta=0.85, tol=1e-6)

# plot convergence
plt.figure(figsize=(10, 6))
plt.plot(range(1, len(diffs) + 1), diffs)
plt.xlabel("Iteration")
plt.ylabel("Rank Score Difference")
plt.title("PageRank Convergence - web-Google_10k.txt")
plt.grid(True)
plt.savefig("convergence_10k.png", dpi=150)
plt.show()

top10 = sorted(PR.items(), key=lambda x: x[1], reverse=True)[:10]
print(f"\nTop 10 nodes by PageRank:")
for node, score in top10:
    print(f"  Node {node}: {score:.8f}")

print(f"Sum of all ranks: {sum(PR.values()):.6f}")

# closed form solution for 10k
def closed_form_pagerank(working_nodes, working_out, working_in, N, beta=0.85):
    node_list = sorted(working_nodes)
    node_to_idx = {n: i for i, n in enumerate(node_list)}
    Np = len(node_list)

    # build sparse matrix M
    rows, cols, vals = [], [], []
    for v in node_list:
        out_degree = len(working_out[v])
        if out_degree > 0:
            for u in working_out[v]:
                if u in node_to_idx:
                    rows.append(node_to_idx[u])
                    cols.append(node_to_idx[v])
                    vals.append(1.0 / out_degree)

    M = sparse.csc_matrix((vals, (rows, cols)), shape=(Np, Np))

    # solve closed-form equation
    I = sparse.eye(Np, format='csc')
    A = I - beta * M
    b = np.ones(Np) * (1 - beta) / N

    PR_vec = spsolve(A, b)

    return {node_list[i]: PR_vec[i] for i in range(Np)}


working_nodes, working_out, working_in, removal_order = remove_dead_ends(
    nodes, out_edges, in_edges)

PR_closed = closed_form_pagerank(working_nodes, working_out, working_in, len(nodes), beta=0.85)
PR_closed = restore_dead_ends(PR_closed, removal_order, in_edges, out_edges, len(nodes), beta=0.85)

# Compare top 10 nodes from iterative and closed-form solutions
print(f"\n{'Node':<12} {'Iterative':<16} {'Closed-form':<16} {'Difference':<16}")
top10_iter = sorted(PR.items(), key=lambda x: x[1], reverse=True)[:10]
for node, score in top10_iter:
    cf_score = PR_closed.get(node, 0)
    print(f"{node:<12} {score:.10f}    {cf_score:.10f}    {abs(score - cf_score):.2e}")

# web-Google.txt
filepath = "Assignment 2/web-Google.txt"
print(f"Dataset: {filepath}")
nodes, out_edges, in_edges = load_graph(filepath)
print(f"Total nodes: {len(nodes)}")

PR, diffs = run_pagerank(nodes, out_edges, in_edges, beta=0.85, T=10)

top10 = sorted(PR.items(), key=lambda x: x[1], reverse=True)[:10]
print(f"\nTop 10 nodes by PageRank:")
for node, score in top10:
    print(f"  Node {node}: {score:.8f}")

print(f"Sum of all ranks: {sum(PR.values()):.6f}")    
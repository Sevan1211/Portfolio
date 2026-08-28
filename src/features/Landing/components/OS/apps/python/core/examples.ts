/**
 * Example programs for the Python IDE.
 *
 * Every example runs against real CPython (Pyodide). All but the NumPy one
 * are pure standard library, so they execute instantly. The default is the
 * Mandelbrot render: it looks impressive, finishes in milliseconds, and
 * invites people to tweak the numbers.
 */

export interface PyExample {
  id: string;
  label: string;
  code: string;
  /** Pre-filled stdin for examples that read input(). */
  stdin?: string;
}

const MANDELBROT = `# The Mandelbrot set, rendered as ASCII.
# Real Python running in your browser. Edit anything and press Run.

WIDTH, HEIGHT = 72, 24
MAX_ITER = 40
CHARS = " .,:;-=+*#%@"

for row in range(HEIGHT):
    line = ""
    for col in range(WIDTH):
        # Map this character cell onto the complex plane
        c = complex(-2.1 + 2.9 * col / WIDTH, -1.2 + 2.4 * row / HEIGHT)
        z = 0j
        for n in range(MAX_ITER):
            z = z * z + c
            if abs(z) > 2:
                line += CHARS[n * (len(CHARS) - 1) // MAX_ITER]
                break
        else:
            line += "@"
    print(line)

print()
print("Try changing MAX_ITER, the characters, or the window on the plane.")
`;

const ASTAR = `# A* pathfinding, the same family of search the Pac-Man ghosts use.
import heapq

MAZE = """\\
S.....#...
.###..#.#.
...#..#.#.
.#.#..#.#.
.#.####.#.
.#......#.
.#.####.#.
...#....#G"""

grid = [list(row) for row in MAZE.split("\\n")]
R, C = len(grid), len(grid[0])
start = next((r, c) for r in range(R) for c in range(C) if grid[r][c] == "S")
goal = next((r, c) for r in range(R) for c in range(C) if grid[r][c] == "G")

def h(a, b):  # Manhattan distance heuristic
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

frontier = [(h(start, goal), 0, start)]
came_from, cost = {start: None}, {start: 0}
explored = 0

while frontier:
    _, g, node = heapq.heappop(frontier)
    explored += 1
    if node == goal:
        break
    r, c = node
    for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
        if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != "#":
            ng = g + 1
            if (nr, nc) not in cost or ng < cost[(nr, nc)]:
                cost[(nr, nc)] = ng
                came_from[(nr, nc)] = node
                heapq.heappush(frontier, (ng + h((nr, nc), goal), ng, (nr, nc)))

# Walk the path backwards and draw it onto the maze
node, steps = came_from[goal], 0
while node and node != start:
    grid[node[0]][node[1]] = "*"
    node, steps = came_from[node], steps + 1

print("\\n".join("".join(row) for row in grid))
print(f"\\npath: {steps + 1} steps · nodes explored: {explored}")
`;

const SALES_ROLLUP = `# Group and aggregate a CSV with nothing but the standard library.
import csv, io, statistics

DATA = """region,rep,revenue
West,Ava,128400
East,Noah,96250
West,Mia,143900
North,Leo,88100
East,Zoe,102300
West,Kai,97600
North,Ivy,91800
East,Eli,99400
"""

rows = list(csv.DictReader(io.StringIO(DATA)))
by_region: dict[str, list[int]] = {}
for row in rows:
    by_region.setdefault(row["region"], []).append(int(row["revenue"]))

print(f"{'region':<8}{'reps':>5}{'total':>10}{'mean':>10}")
print("-" * 33)
for region, values in sorted(by_region.items(), key=lambda kv: -sum(kv[1])):
    total, mean = sum(values), int(statistics.mean(values))
    print(f"{region:<8}{len(values):>5}{total:>10,}{mean:>10,}")
`;

const NUMPY_DEMO = `# Third-party packages install automatically on first import.
# numpy downloads once (a few seconds), then it's cached.
import numpy as np

rng = np.random.default_rng(seed=7)
a = rng.integers(1, 20, size=(4, 4))

print("matrix:")
print(a)
print()
print("row sums:     ", a.sum(axis=1))
print("column means: ", a.mean(axis=0))
print("determinant:  ", round(np.linalg.det(a.astype(float)), 2))
`;

const STDIN_DEMO = `# input() reads lines from the Stdin panel (toolbar > Stdin).
# Each call to input() consumes the next line.

name = input("name: ")
count = int(input("count: "))

for i in range(1, count + 1):
    print(f"{i:>2}  hello, {name}!")
`;

export const EXAMPLES: PyExample[] = [
  { id: "blank", label: "Blank file", code: "" },
  { id: "mandelbrot", label: "Mandelbrot set", code: MANDELBROT },
  { id: "astar", label: "A* pathfinding", code: ASTAR },
  { id: "sales", label: "CSV rollup", code: SALES_ROLLUP },
  { id: "numpy", label: "NumPy matrix", code: NUMPY_DEMO },
  {
    id: "stdin",
    label: "Reading input()",
    code: STDIN_DEMO,
    stdin: "Sevan\n3",
  },
];

export const DEFAULT_EXAMPLE = EXAMPLES.find(
  (example) => example.id === "mandelbrot",
)!;
export const CUSTOM_EXAMPLE_ID = "custom";

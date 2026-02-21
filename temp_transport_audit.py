import math
import sys
from statistics import mean
from fastapi.testclient import TestClient

sys.path.append("backend")
import main  # noqa: E402


def dist_m(a, b):
    lat1, lng1 = a
    lat2, lng2 = b
    mean_lat = math.radians((lat1 + lat2) / 2.0)
    d_lat = (lat2 - lat1) * 111320.0
    d_lng = (lng2 - lng1) * 111320.0 * math.cos(mean_lat)
    return math.hypot(d_lat, d_lng)


def route_length_m(path):
    if len(path) < 2:
        return 0.0
    return sum(
        dist_m((path[i]["lat"], path[i]["lng"]), (path[i + 1]["lat"], path[i + 1]["lng"]))
        for i in range(len(path) - 1)
    )


def max_jump_m(path):
    if len(path) < 2:
        return 0.0
    return max(
        dist_m((path[i]["lat"], path[i]["lng"]), (path[i + 1]["lat"], path[i + 1]["lng"]))
        for i in range(len(path) - 1)
    )


client = TestClient(main.app)
routes = client.get("/api/transport/routes").json()
buses = client.get("/api/transport/buses").json()
first = client.get("/api/transport/buses").json()
second = client.get("/api/transport/buses").json()

route_by_ref = {r["route_number"]: r for r in routes}
route_refs = set(route_by_ref.keys())
bus_route_refs = {b["route_number"] for b in buses}

missing_shapes_for_active = sorted(bus_route_refs - route_refs)
unused_shapes = sorted(route_refs - bus_route_refs)

lengths = [route_length_m(r["path"]) for r in routes if len(r.get("path", [])) >= 2]
jumps = [max_jump_m(r["path"]) for r in routes if len(r.get("path", [])) >= 2]

short_routes = sorted(
    [(r["route_number"], route_length_m(r["path"])) for r in routes if route_length_m(r["path"]) < 1200],
    key=lambda x: x[1],
)
high_jump_routes = sorted(
    [(r["route_number"], max_jump_m(r["path"])) for r in routes if max_jump_m(r["path"]) > 700],
    key=lambda x: x[1],
    reverse=True,
)

print(f"routes_count={len(routes)}")
print(f"buses_count={len(buses)}")
print(f"active_routes={len(bus_route_refs)}")
print(f"missing_shapes_for_active={len(missing_shapes_for_active)} sample={missing_shapes_for_active[:10]}")
print(f"unused_shapes={len(unused_shapes)} sample={unused_shapes[:10]}")
print(f"route_length_avg_m={mean(lengths):.1f}" if lengths else "route_length_avg_m=0.0")
print(f"route_length_min_m={min(lengths):.1f}" if lengths else "route_length_min_m=0.0")
print(f"route_length_max_m={max(lengths):.1f}" if lengths else "route_length_max_m=0.0")
print(f"jump_avg_m={mean(jumps):.1f}" if jumps else "jump_avg_m=0.0")
print(f"jump_max_m={max(jumps):.1f}" if jumps else "jump_max_m=0.0")
print(f"short_routes_lt_1_2km={len(short_routes)} sample={short_routes[:10]}")
print(f"high_jump_routes_gt_700m={len(high_jump_routes)} sample={high_jump_routes[:10]}")

first_geo = sorted((i["id"], i["lat"], i["lng"], i.get("heading")) for i in first)
second_geo = sorted((i["id"], i["lat"], i["lng"], i.get("heading")) for i in second)
print(f"stable_geo_snapshot={first_geo == second_geo}")

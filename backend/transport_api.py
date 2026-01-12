@app.get("/api/transport/buses")
def get_bus_locations(db: Session = Depends(get_db)):
    """Fetch real-time bus locations with occupancy and comfort data"""
    buses = db.query(BusLocation).all()
    results = []
    
    # Simulate slight movement and add comfort metrics
    for bus in buses:
        bus.lat += (random.random() - 0.5) * 0.001
        bus.lng += (random.random() - 0.5) * 0.001
        
        # Determine occupancy based on route and time (simulated)
        occupancy = random.randint(20, 95) if bus.route_number in ["92", "32", "121"] else random.randint(5, 60)
        
        results.append({
            "id": bus.id,
            "route_number": bus.route_number,
            "lat": bus.lat,
            "lng": bus.lng,
            "last_updated": datetime.datetime.now().isoformat(),
            "occupancy": occupancy,
            "has_ac": random.random() > 0.3, # 70% chance of AC
            "has_wifi": random.random() > 0.5,
            "is_eco": bus.route_number in ["92", "12"] # Electric buses
        })
        
    db.commit()
    return results

@app.get("/api/transport/eco-stats")
async def get_eco_stats():
    """Daily CO2 savings stats"""
    return {
        "co2_saved_kg": random.randint(1200, 4500),
        "trees_equivalent": random.randint(50, 200),
        "electric_buses_active": 42
    }

import { useState } from 'react'

const TripCostCalculator = ({ distance, onUseBid }) => {

    const [fuelPrice, setFuelPrice] = useState(96)
    const [mileage, setMileage] = useState(4)
    const [driverWage, setDriverWage] = useState(2000)
    const [toll, setToll] = useState(800)
    const [otherCosts, setOtherCosts] = useState(500)

    const fuelNeeded = distance / mileage

    const fuelCost = fuelNeeded * fuelPrice

    const totalCost =
        fuelCost +
        Number(driverWage) +
        Number(toll) +
        Number(otherCosts)

    const suggestedBid = totalCost * 1.20

    const profit = suggestedBid - totalCost

    return (
        <div>

            <h2>Trip Cost Calculator</h2>

            <p>
                Distance: {distance} km
            </p>

            <label>
                Current fuel price:
                <input
                    type="number"
                    value={fuelPrice}
                    onChange={(e) =>
                        setFuelPrice(e.target.value)
                    }
                />
            </label>

            <br />

            <label>
                Truck mileage:
                <input
                    type="number"
                    value={mileage}
                    onChange={(e) =>
                        setMileage(e.target.value)
                    }
                />
                km/L
            </label>

            <br />

            <label>
                Driver wage:
                <input
                    type="number"
                    value={driverWage}
                    onChange={(e) =>
                        setDriverWage(e.target.value)
                    }
                />
            </label>

            <br />

            <label>
                Toll:
                <input
                    type="number"
                    value={toll}
                    onChange={(e) =>
                        setToll(e.target.value)
                    }
                />
            </label>

            <br />

            <label>
                Other costs:
                <input
                    type="number"
                    value={otherCosts}
                    onChange={(e) =>
                        setOtherCosts(e.target.value)
                    }
                />
            </label>

            <hr />

            <p>
                Fuel needed:
                {fuelNeeded.toFixed(1)} L
            </p>

            <p>
                Fuel cost:
                ₹{fuelCost.toFixed(0)}
            </p>

            <h3>
                Total trip cost:
                ₹{totalCost.toFixed(0)}
            </h3>

            <p>
                Suggested bid (20% markup):
                ₹{suggestedBid.toFixed(0)}
            </p>

            <p>
                Expected profit:
                ₹{profit.toFixed(0)}
            </p>

            <button
                onClick={() =>
                    onUseBid(Math.round(suggestedBid))
                }
            >
                Use this as my bid amount
            </button>

        </div>
    )
}

export default TripCostCalculator
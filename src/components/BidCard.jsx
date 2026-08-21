import '../styles/BidCard.css'

const BidCard = ({ bid, isShipper, onAccept, acceptingBid }) => {

    const status = String(bid.status || 'pending').toLowerCase()

    console.log('BID CARD:', {
        bidId: bid.id,
        status,
        isShipper,
        transporter: bid.transporter_name
    })

    return (
        <div className="bid-card">

            <div className="bid-card-left">

                <div className="transporter-avatar">
                    {bid.transporter_name
                        ?.charAt(0)
                        ?.toUpperCase() || 'T'}
                </div>

                <div className="transporter-info">

                    <h3>
                        {bid.transporter_name || 'Transporter'}
                    </h3>

                    <p>
                        {bid.note || 'No message provided'}
                    </p>

                </div>

            </div>

            <div className="bid-card-right">

                <div className="bid-price-section">

                    <div className="bid-amount">
                        ₹{Number(bid.amount).toLocaleString('en-IN')}
                    </div>

                    <span className={`bid-status ${status}`}>
                        {status}
                    </span>

                </div>

                {isShipper && status === 'pending' && (

                    <button
                        type="button"
                        className="accept-bid-btn"
                        onClick={() => onAccept(bid.id)}
                        disabled={acceptingBid === bid.id}
                    >
                        {acceptingBid === bid.id
                            ? 'Accepting...'
                            : 'Accept Bid'
                        }
                    </button>

                )}

            </div>

        </div>
    )
}

export default BidCard
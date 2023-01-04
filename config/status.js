var process = {
    order_in_store: 1,
    order_cooking: 2,
    order_ready_pickup: 3,
    order_pickup: 4,
    order_delivering: 5,
    order_cancel: 6
}

var status = {
    cooking: 1,
    cancelled: 2,
    readyToPickup: 3,
    delivering: 4,
    return: 5
}

module.exports = {process,status}
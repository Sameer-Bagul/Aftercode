export function getNextPendingItem(state) {
    return state.repositories.find((r) => r.status === 'pending' || r.status === 'failed') || null;
}
export function getPendingItems(state) {
    return state.repositories.filter((r) => r.status === 'pending' || r.status === 'failed');
}

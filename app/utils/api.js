// app/utils/api.js
import axios from 'axios';

// Define the base URL for your API
const BASE_URL = 'http://localhost:3000/api';

// Function to join a match
export const joinMatch = async (matchId, teamCode, userId) => {
    try {
        const response = await axios.post(`${BASE_URL}/match/join/${matchId}`, {
            teamCode,
            userId,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.error || 'Failed to join match');
    }
};

// Function to create a transaction
export const createTransaction = async (userId, amount, type, walletType) => {
    try {
        const response = await axios.post(`${BASE_URL}/transaction`, {
            userId,
            amount,
            type,
            walletType,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.error || 'Failed to create transaction');
    }
};
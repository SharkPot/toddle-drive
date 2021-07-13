import { createSlice } from '@reduxjs/toolkit'

import { testData } from './fakeData';

export const driveSlice = createSlice({
    name: 'drive',
    initialState: { 
        value: testData, 
    },
    reducers: {
        create: (state,action) => {
            state.value.push(action.payload);
        },
        remove: (state, action) => {
            state.value.splice(state.value.findIndex(val => val.id === action.payload), 1);
        },
        update: (state, action) => {
            let index = state.value.findIndex(val => val.id === action.payload.id);
            state.value[index] = action.payload;
        }
    },
})

export const { create, remove, update } = driveSlice.actions

export default driveSlice.reducer
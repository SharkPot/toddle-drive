import { configureStore } from '@reduxjs/toolkit';
import driveReducer from './driveStateSlice';

export default configureStore({ 
    reducer: {
        drive: driveReducer,
    },
})
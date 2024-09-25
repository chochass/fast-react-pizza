import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getAddress } from '../../services/apiGeocoding'

function getPosition() {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

export const fetchAddress = createAsyncThunk(
    'user/fetchAdress',
    async function () {
        // 1) We get the user's geolocation position
        console.log('Fetching position...')
        const positionObj = await getPosition()
        const position = {
            latitude: positionObj.coords.latitude,
            longitude: positionObj.coords.longitude,
        }

        // 2) Then we use a reverse geocoding API to get a description of the user's address, so we can display it the order form, so that the user can correct it if wrong
        console.log('Fetching address...')
        const addressObj = await getAddress(position)
        const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`

        // 3) Then we return an object with the data that we are interested in
        // payload of the fullfiled state
        console.log('Returning payload:', { position, address })
        return { position, address }
    }
)

const initialState = {
    username: '',
    status: 'idle',
    position: {},
    address: '',
    error: '',
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateName(state, action) {
            state.username = action.payload
        },
    },
    extraReducers: (builder) =>
        builder
            .addCase(
                fetchAddress.pending,
                (state, action) => (state.status = 'loading')
            )
            .addCase(fetchAddress.fulfilled, (state, action) => {
                state.position = action.payload.position
                state.address = action.payload.address
                state.status = 'idle'
            })
            .addCase(fetchAddress.rejected, (state, action) => {
                state.status = 'error'
                // state.error = action.error.message
                // TO DO
                state.error =
                    'There was a problem getting your address. Make sure to fill this field!'
            }),
})

export const { updateName } = userSlice.actions

export default userSlice.reducer

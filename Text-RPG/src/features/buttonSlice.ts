import { createSlice } from "@reduxjs/toolkit";

interface ButtonState {
  isDisabled: boolean;
}

const initialState: ButtonState = {
  isDisabled: false,
};

const buttonSlice = createSlice({
  name: "button",
  initialState,
  reducers: {
    disableButton: (state) => {
      state.isDisabled = true;
    },
    enableButton: (state) => {
      state.isDisabled = false;
    },
  },
});

export const { disableButton, enableButton } = buttonSlice.actions;
export default buttonSlice.reducer;

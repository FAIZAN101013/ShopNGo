import React from 'react'

const Login = () => {
  return (
    <div>
      """
        1. Convert the input number into a string.
        2. Reverse the string.
        3. Check if the original and reversed strings are the same.
        4. If they are the same, return True (it's a palindrome), otherwise return False.
        """
        x_str = str(x)  # Convert number to string
        reverse_str = x_str[::-1]  # Reverse the string
        return x_str == reverse_str  # Compare original and reversed string

    </div>
  )
}

export default Login

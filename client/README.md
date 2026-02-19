```js
import axios from "axios";

axios.defaults.withCredentials = true;

const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      "http://your-api-url/api/admin/users/login",
      {
        email,
        password,
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  try {
    await axios.post("http://your-api-url/api/admin/users/logout");
  } catch (error) {
    throw error;
  }
};

const fetchProtectedData = async () => {
  try {
    const response = await axios.get(
      "http://your-api-url/api/admin/protected-route"
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
    }
    throw error;
  }
};
```

import { useState } from "react";

const useAlert = () => {
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => {
            setAlert(null);
        }, 3000);
    };

    const hideAlert = () => {
        setAlert(null);
    };

    return { alert, showAlert, hideAlert };
};

export default useAlert;
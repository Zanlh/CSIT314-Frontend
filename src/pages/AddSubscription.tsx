import Nav from "../components/Nav";
import Footer from '../components/Footer';
import "../styles/forms.css";
import { useState } from "react";
import axios from "axios";
import BACKEND_URL from "../components/utils/Constants";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Request = () => {
    const [rego, setRego] = useState("");

    const makeRequest = (evt: any) => {
        evt.preventDefault();
        
        let username = localStorage.getItem("username")?.replaceAll('"', '');

        let body = {
            username: username,
            vehicle_registration: rego
        }

        let token = localStorage.getItem("token")?.replaceAll('"', '');

        // this should be extracted so it can be used by multiple requests
        let headers = {
            "Authorization": `Token ${token}`
        }

        // axios request
        axios.post(`${BACKEND_URL}/update_subscriptions/`, body, {headers: headers})
        .then(response => {
            toast.success("Success! New car added!", {
                position: "top-center",
                autoClose: 5000,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                });
        })
        .catch((error) => {
            for (const property in error.response.data) {
                console.log(`${property}: ${error.response.data[property][0]}`);
                toast.error(
                    `${property}: ${error.response.data[property][0]}`,
                {
                    position: "top-center",
                    autoClose: 10000,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                }
                );
            }
            console.log(error.response.data);
            console.log(error.request);
            console.log(error.message);
        });
    }

    return (
        <>
        <Nav/>
        <div className="auth-inner">
                <form onSubmit={makeRequest}>
                    <h3>Add new vehicle subscription</h3>

                    <div className="form-group">
                        <label>Vehicle registration number</label>
                        <input type="text" className="form-control" placeholder="Vehicle registration number"  onChange={e => setRego(e.target.value)}/>
                    </div>
                    
                    <div style={{padding: "1em"}}>
                    <button type="submit" className="btn btn-primary btn-block">Add vehicle</button>
                    </div>
                </form>
            </div>
        <Footer/>
        </>
    );
};

export default Request;
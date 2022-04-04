import Nav from "../../components/Nav";
import Footer from '../../components/Footer';
import "../../styles/forms.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Checkout from "./Checkout";
import BACKEND_URL, { FRONTEND_URL } from "../../components/utils/Constants";
import { makeAuthenticatedPostRequest } from "../../components/utils/Helpers";
import BootstrapModal from "./BootstrapModal";

const CustomersCurrentRequest = (props: any) => {
    const [rating, setRating] = useState<any>();
    const [review, setReview] = useState<any>();
    
    const reviewCallout = (evt: any) => {
        evt.preventDefault();
        
        let details = props.request;

        let body = {
            username: details.username,
            location: details.location,
            description: details.description,
            status: "REVIEWED",
            mechanic: details.mechanic,
            review: review,
            rating: rating,
        }

        makeAuthenticatedPostRequest("/update_callout/", 
        "Success! Thank you for using our service!", 
        body, 
        FRONTEND_URL);
    }

    const cancelCallout = () => {
        alert('cancelled');
        // let body = {
        //     username: props.subscription.username,
        //     vehicle_registration: props.subscription.vehicle_registration,
        //     active: false
        // }

        // makeAuthenticatedPostRequest("/update_subscription/", "Success! Vehicle subscription has been removed from your account.", body, `${FRONTEND_URL}/subscriptions`);
    }

    return (
        <>
            <h1>Status: {props.request.status}</h1>
            <h2>Location: {props.request.location}</h2>
            {props.request.mechanic == "" ? (
                <></>
            ) : (
                <h2>Mechanic: {props.request.mechanic}</h2>
            )}
            
            <BootstrapModal title="Cancel Callout" prompt_question="Are you sure you want to cancel?" function={cancelCallout}/>
            
            {(props.request.status == "COMPLETED") ? (
                <div className="auth-inner">
                    <form onSubmit={reviewCallout}>
                        <h3>Review the service!</h3>

                        <div className="form-group">
                            <label>Rating</label>
                            <input type="text" className="form-control" placeholder="1-10"  onChange={e => setRating(e.target.value)}/>
                        </div>

                        <div className="form-group">
                            <label>Please provide a descriptive review:</label>
                            <input type="text" className="form-control" placeholder="The mechanic was a legend!" onChange={e => setReview(e.target.value)}/>
                        </div>
                        
                        <div style={{padding: "1em"}}>
                        <button type="submit" className="btn btn-primary btn-block">Submit review</button>
                        </div>
                    </form>
                </div>
            ) : (
                <></>
            )}
        </>
    );
}

const Request = () => {
    const [request, setRequest] = useState([]);
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [rego, setRego] = useState("");
    const [hasSubscription, setHasSubscription] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        let username = localStorage.getItem("username")?.replaceAll('"', '');
        let token = localStorage.getItem("token")?.replaceAll('"', '');

        // this should be extracted so it can be used by multiple requests
        let headers = {
            "Authorization": `Token ${token}`
        }

        axios.get(`${BACKEND_URL}/all_callouts`, {headers: headers})
        .then(response => {
            // console.log(response.data);

            var new_request = response.data.filter(function(request: any) {
                return request.username == username && request.status != "REVIEWED";
            });

            console.log(new_request);

            if(new_request.length > 0){
                setRequest(new_request[0]);
            }
        })
        .catch((error) => {
            // TODO: actually handle this error
            console.log(error.response.data);
            console.log(error.request);
            console.log(error.message);
        });
    }, []); 

    const checkIfCarHasSubscription = async () => {
        let username = localStorage.getItem("username")?.replaceAll('"', '');
        let token = localStorage.getItem("token")?.replaceAll('"', '');

        // this should be extracted so it can be used by multiple requests
        let headers = {
            "Authorization": `Token ${token}`
        }

        axios.get(`${BACKEND_URL}/my_subscriptions/?username=${username}`, {headers: headers})
        .then(response => {
            var new_request = response.data.filter(function(sub: any) {
                return sub.vehicle_registration == rego;
            });

            setHasChecked(true);

            if(new_request.length > 0){
                setHasSubscription(true);
                submitRequest();
            }else{
                setHasSubscription(false);
            }            
        })
        .catch((error) => {
            // TODO: actually handle this error
            console.log(error.response.data);
            console.log(error.request);
            console.log(error.message);
        });
    }

    const submitRequest = () => {
        let currentdate = new Date();
        
        let month = `${currentdate.getMonth()}`;
        let day = `${currentdate.getDate()}`;
        let year = `${currentdate.getFullYear()}`;

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        let currentdate_string = `${year}-${month}-${day}`
        let username = localStorage.getItem("username")?.replaceAll('"', '');

        let body = {
            username: username,
            location,
            description,
            status: "PENDING",
            date: currentdate_string
        }

        makeAuthenticatedPostRequest("/create_callout/", "Success! A mechanic will respond shortly!", body);
    }

    const makeRequest = (evt: any) => {
        evt.preventDefault();
        
        setHasChecked(false);

        checkIfCarHasSubscription();
    }

    return (
        <>
        <Nav/>
        {request.length == 0 ? (
            <>
            {!hasSubscription && hasChecked ? (
                <Checkout submitRequest = {submitRequest}/>
            ) : (
                <div className="auth-inner">
                    <form onSubmit={makeRequest}>
                        <h3>Request roadside assistance</h3>

                        <div className="form-group">
                            <label>Location</label>
                            <input type="text" className="form-control" placeholder="Location"  onChange={e => setLocation(e.target.value)}/>
                        </div>

                        <div className="form-group">
                            <label>Provide any detail on your issue:</label>
                            <input type="text" className="form-control" placeholder="eg. My car is on fire" onChange={e => setDescription(e.target.value)}/>
                        </div>

                        <div className="form-group">
                            <label>Car registration:</label>
                            <input type="text" className="form-control" placeholder="XWZ-123" onChange={e => setRego(e.target.value)}/>
                        </div>
                        
                        <div style={{padding: "1em"}}>
                        <button type="submit" className="btn btn-primary btn-block">Submit request</button>
                        </div>
                    </form>
                </div>
            )}
            </>
        ) : (
            <CustomersCurrentRequest request={request}/>
        )}
        <Footer/>
        </>
    );
};

export default Request;
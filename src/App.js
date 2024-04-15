import './App.css';
import '../src/pages/pageStyle.css'
import 'boxicons/css/boxicons.min.css';
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/account-pages/Login';
import SignUp from './pages/account-pages/AccountCreation';
import PrivateRoute from './auth/PrivateRoute';
import { setHeaderToken } from './auth/interceptors';
import { privateRoute } from './routes/routes';

function App() {

    useEffect(() => {
        setHeaderToken();
      }, []); 

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<AppLayout />}>
                    <Route index element={<Login />} />
                    <Route path='/register' element={<SignUp />} />

                    {privateRoute.map((route, index) => (
                        <Route key={index} exact path={route.path} element={<PrivateRoute/>}>
                            <Route exact path={route.path} element={route.element}/>
                        </Route>
                    ))}

                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

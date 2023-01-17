import { useEffect, useState, Fragment } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LintechPicture from './assets/1673710275502.jpeg';
import axios from 'axios';
import Swal from 'sweetalert2'
import { RFC_2822 } from 'moment';

const IP_ADDR = "http://localhost:6969";
const Login = (props) => {

    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [state, setState] = useState(1);

    var a = 0;

    function mouseOver(){
        if ((username == null && password == null) && a == 0){
            buttonMoveLeft();
            a=1;
            return false;
        } 
        if ((username == null && password == null) && a == 1){
            buttonMoveRight();
            a=2;
            return false;
        } 
        if ((username == null && password == null) && a == 2){
            buttonMoveLeft();
            a=1;
            return false;
        }
        else{
            return false;
        }
    }

    function buttonMoveLeft(){
            const button = document.getElementById('runaway-btn');
            button.style.transform = 'translateX(120%)';
    };

    function buttonMoveRight(){
        const button = document.getElementById('runaway-btn');
        button.style.transform = 'translateX(0%)';
};

    var mystyle = {
        left:
            state === 1 ? "0px" : state === 2 ? "200px" : state === 3 ? "450px" : "",
        position: password === null || username === null
    }

    const handleLogin = () => {
        axios.post(`${IP_ADDR}/login`, {
            username: username,
            password: password
        })
        .then(function (response) {
            if (response.data.status == true) {
                let timerInterval;
                Swal.fire({
                    icon: 'success',
                    title: response.data.message,
                    text: 'Galing mag type ah! 🐄  🥬',
                    footer: '<div />',
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading()
                        const b = Swal.getHtmlContainer().querySelector('b')
                        timerInterval = setInterval(() => {
                        b.textContent = Swal.getTimerLeft()
                        }, 100)
                    },
                    willClose: () => {
                        clearInterval(timerInterval)
                    },
                    showConfirmButton: false 
                }).then(()=> {
                    console.log('I was closed by the timer')
                    localStorage.setItem('credentials', JSON.stringify(response.data));
                    props.setSwitcher(1);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.data.message,
                    footer: '<a href="">Nakalimutan mo password mo?</a>'
                });
            }
        })
        .catch(function (error) {
            console.log(error);
        });
        
    }
    return (
        <Fragment>
            <div style={{backgroundColor: 'grey', height: window.innerHeight}}>
                <CssBaseline />
                <Container maxWidth="md">
                    <Grid container justifyContent="center" alignItems="center">
                            <Card sx={{ height: '75vh', width: '75vh', marginTop: '10%', boxShadow: 10, backgroundColor: '#cbcaca', p: 2}}>
                                <CardMedia
                                    sx={{ height: '35vh'}}
                                    image={LintechPicture}
                                    title="Samgyup"
                                />
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        sx={{
                                        mr: 2,
                                        display: { xs: 'none', md: 'flex' },
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        letterSpacing: '.3rem',
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        }}
                                    >
                                        LinTech 🐄  🥬 Output Tracker
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pang track ng oras para hindi pagalitan ng MEAL
                                    </Typography>
                                    <Grid container sx={{p: 2}} spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                id="outlined-required"
                                                label="Username"
                                                autoComplete="off"
                                                onChange={(e)=> setUsername(e.target.value)}
                                                sx={{width: '100%'}}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                id="outlined-required"
                                                label="Password"
                                                type="password"
                                                autoComplete="off"
                                                onChange={(e)=> setPassword(e.target.value)}
                                                sx={{width: '100%'}}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <CardActions sx={{justifyContent: "flex-end", mr: 3}}>
                                        <div style={{width: '100%', position: 'relative', height: '60px', display: 'block'}}>
                                            <Button id='runaway-btn'
                                                    variant="contained" 
                                                    size="medium" 
                                                    onClick={handleLogin} 
                                                    style={mystyle}
                                                    onMouseOver={mouseOver}>
                                                    Login
                                            </Button>
                                        </div>
                                </CardActions>
                            </Card>
                    </Grid>
                </Container>
            </div>
        </Fragment>
    )
}

export default Login;
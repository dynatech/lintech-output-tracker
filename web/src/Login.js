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
import Swal from 'sweetalert2';
import { motion, useAnimation } from "framer-motion"
import { useSnackbar } from 'notistack';
  
const IP_ADDR = "http://192.168.150.108t:6969";

const Login = (props) => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleClick = () => {
        enqueueSnackbar('Huwag bobito, kailangan nang complete credentials!');
    };
    
    const divAnimationControls = useAnimation();

	const divAnimationVariants = {
	    anim: {
	        x: Math.floor(Math.random() * (2 - 1 + 1) + 1) == 1 ? 600 : -600,
            y: Math.random() * (500 - -500) + -500,
		    transition: {
	            type: "spring",
                stiffness: 35
	        },
            rotate: [0, -200]
	    }
	}

    const divAnimationVariantsBalik = {
        anim: {
	        x: 0,
            y: 0,
		    transition: {
	            type: "spring",
                stiffness: 35
	        },
            rotate: [-200, 0]
	    }
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

    useEffect(()=> {
        if (username != "" && password != "" && isHidden == true) {
            console.log("HIT")
            divAnimationControls.start(divAnimationVariantsBalik.anim)
            setIsHidden(false);
        }
    }, [username, password, isHidden])


    return (
        <Fragment>
            <div style={{backgroundColor: 'grey', height: window.innerHeight}}>
                <CssBaseline />
                <Container maxWidth="md">
                    <Grid container justifyContent="center" alignItems="center">
                            <Card sx={{ height: '80vh', width: '75vh', marginTop: '10%', boxShadow: 10, backgroundColor: '#fdfdfd', p: 2}}>
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
                                <CardActions>
                                    <Grid container sx={{justifyContent: 'center'}}>
                                    { username === "" || password === "" ? (
                                            <motion.div
                                                animate={divAnimationControls}
                                                onFocus={()=> {
                                                    enqueueSnackbar('Aba! Gumamit pa ng tab. kala mo talaga di ko alam.');
                                                    if (!isAnimationPlaying) {
                                                        setIsAnimationPlaying(true)
                                                        divAnimationControls.start(divAnimationVariants.anim)
                                                        }
                                                    else {
                                                        setIsAnimationPlaying(false)
                                                        divAnimationControls.start(divAnimationVariants.anim)
                                                    }
                                                    setIsHidden(true);
                                                }}
                                                onHoverStart={() => {
                                                    if (!isAnimationPlaying) {
                                                        setIsAnimationPlaying(true)
                                                        handleClick()
                                                        divAnimationControls.start(divAnimationVariants.anim)
                                                        }
                                                    else {
                                                        setIsAnimationPlaying(false)
                                                        handleClick()
                                                        divAnimationControls.start(divAnimationVariants.anim)
                                                    }
                                                    setIsHidden(true);
                                                    }}>
                                                <Button variant="contained" size="medium">Login</Button>
                                            </motion.div>
                                        
                                        ) : (
                                                <motion.div
                                                    animate={divAnimationControls}>
                                                    <Button variant="contained" size="medium" onClick={handleLogin}>Login</Button>
                                                </motion.div>
                                            )
                                    }
                                    </Grid>
                                </CardActions>
                            </Card>
                    </Grid>
                </Container>
            </div>
        </Fragment>
    )
}

export default Login;
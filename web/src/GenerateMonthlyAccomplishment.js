import { useEffect, Fragment } from'react';
import Header from "./Header";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

const GenerateMonthlyAccomplishment = () => {
    return (
        <Fragment>
            <Header />
            <Container maxWidth="xl">
                <Grid container spacing={2} sx={{mt: 2}}>
                    <Grid item xs={7} sx={{backgroundColor: 'red'}}>
                        <h1>FORM HERE</h1>
                    </Grid>
                    <Grid item xs={5} sx={{backgroundColor: 'blue'}}>
                        <h1>PREVIEW HERE</h1>
                    </Grid>
                </Grid>
            </Container>
        </Fragment>
    )
}

export default GenerateMonthlyAccomplishment;
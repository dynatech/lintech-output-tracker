import { useEffect, Fragment, useState } from'react';
import Header from "./Header";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import moment from 'moment';
import axios from 'axios';

const IP_ADDR = "http://localhost:6969";

const RenderOutputRow = ({output}) => {
    return(
        <Fragment>
            <Grid item xs={12}>
                <Grid container spacing={2} sx={{pr: 2}}>
                    <Grid item xs={3} >
                        <TextField id="outlined-basic" label="Logframe" 
                            value={output.logframe} 
                            variant="outlined" sx={{width: '100%'}}/>
                    </Grid>
                    <Grid item xs={5}>
                        <TextField id="outlined-basic" 
                            label="Actual Outputs" 
                            value={output.actual_output} 
                            variant="outlined" 
                            multiline
                            rows={4}
                            sx={{width: '100%'}}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField id="outlined-basic" 
                            label="Remarks" 
                            value={output.remarks} 
                            variant="outlined" 
                            multiline
                            rows={4}
                            sx={{width: '100%'}}/>
                    </Grid>
                </Grid>
            </Grid>
        </Fragment>
    )
}

const GenerateMonthlyAccomplishment = () => {

    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [outputList, setOutputList] = useState([]);
    const [actualOutputList, setActualOutputList] = useState([]);

    const handleGenerate = () => {
        getMonitoringShifts();
        getActualOutputs();
    }

    const getMonitoringShifts = () => {
        let data = {
            ts_start: moment(startDate).format("YYYY-MM-DD 00:00:00"),
            ts_end: moment(endDate).format("YYYY-MM-DD 23:59:59"),
            user_id: JSON.parse(localStorage.getItem('credentials'))['credentials']['user_id']
        }
        axios.post(`http://192.168.150.110:5000/api/shift_checker/get_shift_data`, data).then((response)=> {
            let output = {
                logframe: '2.3.2 Monitoring Operations',
                actual_output: '',
                remarks: ''
            }
            if (response.status === 200) {
                response.data.forEach(element => {
                    output.actual_output = output.actual_output + `${moment(element.date).format('LL')} ${element.ampm} Shift \n`
                    element.data.forEach(alert => {
                       output.actual_output = output.actual_output + ` - ${alert.internal_alert} (${alert.site_code.toUpperCase()})\n`
                       if (alert.general_status != 'on-going') {
                        output.remarks = output.remarks + ` - ${alert.general_status == 'lowering' && `${alert.site_code.toUpperCase()} had been lowered to A0`}\n`;
                       }
                       
                    });
                });
                setOutputList([...outputList, output]);
            }
        })
    }

    const getActualOutputs = () => {
        let data = {
            ts_start: moment(startDate).format("YYYY-MM-DD 00:00:00"),
            ts_end: moment(endDate).format("YYYY-MM-DD 23:59:59"),
            user_id: JSON.parse(localStorage.getItem('credentials'))['credentials']['user_id']
        }
        let outputs = [];

        axios.post(`${IP_ADDR}/get_accomplished_outputs`, data).then((response)=> {
            if (response.data.status === true) {
                response.data.data.forEach(element => {
                    let output_exist = outputs.findIndex(x => x.logframe == element.major_output);
                    if (output_exist == -1) {
                        outputs.push({
                            logframe: element.major_output,
                            actual_output: ` - ${element.actual_output}`,
                            remarks: ``
                        })
                    } else {
                        outputs[output_exist].actual_output = outputs[output_exist].actual_output + ` - ${element.actual_output}\n`
                    }
                });
                setActualOutputList(outputs);
            }
        });
    }

    return (
        <Fragment>
            <Header />
            <Container maxWidth="xl">
                <Grid container spacing={2} sx={{mt: 2}}>
                    <Grid item xs={8}>
                        <Grid container spacing={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Grid item xs={4} sx={{p: 2}}>
                                    <DesktopDatePicker
                                        label="Start date"
                                        inputFormat="YYYY-MM-DD"
                                        value={startDate}
                                        onChange={(e) => { 
                                            setStartDate(moment(new Date(e)).format("YYYY-MM-DD"))
                                        }}
                                        renderInput={(params) => <TextField {...params} sx={{width: '100%'}}/>}
                                    />
                                </Grid>
                                <Grid item xs={4} sx={{p: 2}}>
                                    <DesktopDatePicker
                                        label="End date"
                                        inputFormat="YYYY-MM-DD"
                                        value={endDate}
                                        onChange={(e) => { setEndDate(moment(new Date(e)).format("YYYY-MM-DD"))}}
                                        renderInput={(params) => <TextField {...params} sx={{width: '100%'}}/>}
                                    />
                                </Grid>
                                <Grid item xs={4} sx={{p: 2, display: 'flex', justifyContent: 'center'}}>
                                    <Button variant="contained" sx={{width: '100%'}} onClick={handleGenerate}>Generate</Button>
                                </Grid>
                            </LocalizationProvider>
                            <Grid item xs={12}>
                                <Divider sx={{mr: 5, ml: 5, mb: 2}}/>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    {
                                        outputList.length != 0 ? 
                                            <Fragment>
                                               {
                                                 outputList.map((row)=> (
                                                    <RenderOutputRow output={row}/>
                                                ))
                                               }
                                               {
                                                 actualOutputList.map((row)=> (
                                                    <RenderOutputRow output={row}/>
                                                ))
                                               }
                                            </Fragment>
                                        :
                                            <Grid item xs={12} sx={{p: 2, display: 'flex', justifyContent: 'center', height: '25rem', alignItems: 'center'}}>
                                                <Typography variant="button" sx={{fontWeight: 'bold'}}>Click mo yung "Generate" dali.</Typography>
                                            </Grid>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6" sx={{textAlign: 'center', fontWeight: 500}}>PREVIEW</Typography>
                        <Box
                            sx={{
                                width: '100%',
                                height: '50rem',
                                border: '1px solid',
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                    backgroundColor: 'white',
                                    opacity: [0.9, 0.8, 0.7],
                                },
                            }}
                            >
                                <Container>
                                    <Grid container spacing={2} sx={{textAlign: 'center', p:4}}>
                                        <Grid item xs={12}>
                                            <Typography sx={{fontWeight: 500}}>ACCOMPLISHMENT REPORT</Typography>
                                            <Typography sx={{fontSize: '0.9rem'}}>For the period covering {moment(startDate).format("MMMM")} {moment(startDate).format("DD")} - {moment(endDate).format("DD")}, {moment(endDate).format("YYYY")}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <table style={{'borderCollapse': 'collapse'}}>
                                                <tr>
                                                    <th style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '12px'}}>Tasks / Activities/ Expected Outputs</th>
                                                    <th style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '12px'}}>Accomplishment / Outputs</th>
                                                    <th style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '12px'}}>Remarks</th>
                                                </tr>
                                            </table>
                                        </Grid>
                                    </Grid>
                                </Container>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Fragment>
    )
}

export default GenerateMonthlyAccomplishment;
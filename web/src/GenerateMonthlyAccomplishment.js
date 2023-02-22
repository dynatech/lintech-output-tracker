import { useEffect, Fragment, useState, createRef } from'react';
import Header from "./Header";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import moment from 'moment';
import axios from 'axios';
import Pdf from "react-to-pdf";

const IP_ADDR = "http://localhost:6969";

const RenderOutputRow = ({output, rowIndex, setOutputList, outputList}) => {
    return(
        <Fragment>
            <Grid item xs={12}>
                <Grid container spacing={2} sx={{pr: 2}}>
                    <Grid item xs={3} >
                        <TextField id="outlined-basic" label="Logframe" 
                            defaultValue={output.logframe} 
                            variant="outlined" sx={{width: '100%'}}
                            onChange={(e) => {
                                let temp = [...outputList];
                                temp[rowIndex].logframe = e.target.value;
                                setOutputList(temp);
                            }}/>
                    </Grid>
                    <Grid item xs={5}>
                        <TextField id="outlined-basic" 
                            label="Actual Outputs" 
                            defaultValue={output.actual_output} 
                            variant="outlined" 
                            multiline
                            rows={4}
                            sx={{width: '100%'}}
                            onChange={(e) => {
                                let temp = [...outputList];
                                temp[rowIndex].actual_output = e.target.value;
                                console.log(temp);
                                setOutputList(temp);
                            }}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField id="outlined-basic" 
                            label="Remarks" 
                            defaultValue={output.remarks} 
                            variant="outlined" 
                            multiline
                            rows={4}
                            sx={{width: '100%'}}
                            onChange={(e) => {
                                let temp = [...outputList];
                                temp[rowIndex].remarks = e.target.value;
                                setOutputList(temp);
                            }}/>
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
    const [additionalOutputs, setAdditionalOutputs] = useState([]);
    const [jobTitle, setJobTitle] = useState(null);
    const ref = createRef();

    useEffect(()=> {
        console.log("JSON.parse(localStorage.getItem('credentials'))['credentials']:", JSON.parse(localStorage.getItem('credentials'))['credentials']);
    }, []);

    const handleGenerate = () => {
        getMonitoringShifts();
        getActualOutputs();
        setBox(false)
    }

    const [box, setBox] = useState(true)


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
                    output.actual_output = output.actual_output + `${moment(element.date).format('LL')} ${element.ampm} Shift`
                    element.data.forEach(alert => {
                       output.actual_output = output.actual_output + ` - ${alert.internal_alert} (${alert.site_code.toUpperCase()})\n`
                       if (alert.general_status != 'on-going') {
                        output.remarks = output.remarks + ` - ${alert.general_status == 'lowering' && `${alert.site_code.toUpperCase()} had been lowered to A0`}\n`;
                       }
                    });
                    output.actual_output = output.actual_output + "\n";
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
                            actual_output: ` - ${element.actual_output} \n`,
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
            <Container maxWidth='xl'  >
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
                                <Grid item xs={12}>
                                <TextField id="outlined-basic" label="Your job title" 
                                    value={jobTitle}
                                    required
                                    onChange={(e)=> {setJobTitle(e.target.value)}} 
                                    variant="outlined" sx={{width: '100%'}}/>
                                </Grid>
                            </LocalizationProvider>
                            <Grid item xs={12}>
                                <Divider sx={{mr: 5, ml: 5, mb: 2}}/>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    {
                                        (outputList.length != 0 || actualOutputList.length != 0) ? 
                                            <Fragment>
                                               {
                                                 outputList.map((row, index)=> (
                                                    <RenderOutputRow output={row} rowIndex={index} setOutputList={setOutputList} outputList={outputList}/>
                                                ))
                                               }
                                               {
                                                 actualOutputList.map((row, index)=> (
                                                    <RenderOutputRow output={row} rowIndex={index} setOutputList={setActualOutputList} outputList={actualOutputList}/>
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
                            {
                                additionalOutputs.map((row, index) => (
                                    <RenderOutputRow output={row} rowIndex={index} setOutputList={setAdditionalOutputs} outputList={additionalOutputs}/>
                                ))
                            }
                            {
                                (outputList.length != 0 || actualOutputList.length != 0) && 
                                    <Grid item xs={12}>
                                        <Button startIcon={<AddCircleOutlineIcon />} onClick={() => {
                                            setAdditionalOutputs([...additionalOutputs, {
                                                logframe: '',
                                                actual_output: '',
                                                remarks: ''
                                            }]);
                                        }}>Add output</Button>
                                    </Grid>
                            }
                        </Grid>
                    </Grid>
                    <Grid item xs={4}>
                        <Pdf targetRef={ref} filename="code-example.pdf">
                            {({ toPdf }) => <button onClick={()=> {
                                toPdf();
                                setBox(true);
                            }}
                                >Generate Pdf</button>}
                        </Pdf>
                        <Typography variant="h6" sx={{marginLeft: box == true ? 0 : 40, textAlign: 'center', fontWeight: 500}}>PREVIEW</Typography>
                        <Box
                            ref={ref}
                            sx={{
                                width: box == true ? '100%' : window.innerWidth-1063,
                                height: box == true ? window.innerHeight-150 : window.innerHeight+200,
                                border: '1px solid',
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                    backgroundColor: 'white',
                                    opacity: [0.9, 0.8, 0.7],
                                },
                            }}
                            >
                                <Container >
                                    <Grid container spacing={2} sx={{textAlign: 'center', pr:3,pl:3,pt:5}}>
                                        <Grid item xs={20} sx={{marginLeft: box == true ? 0 : 8}}>
                                            <Typography sx={{fontWeight: 'bold'}}>ACCOMPLISHMENT REPORT</Typography>
                                            <Typography sx={{fontSize: '0.9rem'}}>For the period covering {moment(startDate).format("MMMM")} {moment(startDate).format("DD")} - {moment(endDate).format("DD")}, {moment(endDate).format("YYYY")}</Typography>
                                        </Grid>
                                        <Grid item xs={12} >
                                            <table style={{'borderCollapse': 'collapse'}}>
                                                <tr>
                                                    <th style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '30%', 'paddingLeft': '10px', 'paddingRight': '10px', 'paddingTop': '2px', 'paddingBottom': '2px'}}>Tasks / Activities/ Expected Outputs</th>
                                                    <th style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '50%', 'paddingLeft': '10px', 'paddingRight': '10px', 'paddingTop': '2px', 'paddingBottom': '2px'}}>Accomplishment / Outputs</th>
                                                    <th style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '20%', 'paddingLeft': '10px', 'paddingRight': '10px', 'paddingTop': '2px', 'paddingBottom': '2px'}}>Remarks</th>
                                                </tr>
                                                {
                                                    outputList.map((el)=> (
                                                        <tr style={{'paddingTop': '5px', 'paddingBottom': '5px'}}>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '30%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line'}}>{el.logframe}<br/></td>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '50%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line', 'textAlign': 'left', 'paddingLeft': '5px', 'paddingRight': '5px'}}>{el.actual_output}</td>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '20%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line', 'textAlign': 'left', 'paddingLeft': '5px', 'paddingRight': '5px'}}>{el.remarks}</td>
                                                        </tr>
                                                    ))
                                                }
                                                {
                                                    actualOutputList.map((el)=> (
                                                        <tr style={{'paddingTop': '5px', 'paddingBottom': '5px'}}>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '30%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line'}}>{el.logframe}<br/></td>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '50%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line', 'textAlign': 'left', 'paddingLeft': '5px', 'paddingRight': '5px'}}>{el.actual_output}</td>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '20%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line', 'textAlign': 'left', 'paddingLeft': '5px', 'paddingRight': '5px'}}>{el.remarks}</td>
                                                        </tr>
                                                    ))
                                                }
                                                {
                                                    additionalOutputs.map((el)=> (
                                                        <tr style={{'paddingTop': '5px', 'paddingBottom': '5px'}}>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '30%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line'}}>{el.logframe}<br/></td>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '50%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line', 'textAlign': 'left', 'paddingLeft': '5px', 'paddingRight': '5px'}}>{el.actual_output}</td>
                                                            <td style={{"borderWidth":"1.5px", 'borderColor':"black", 'borderStyle':'solid', 'fontSize': '10px', 'width': '20%', 'paddingTop': '2px', 'paddingBottom': '2px', 'whiteSpace': 'pre-line', 'textAlign': 'left', 'paddingLeft': '5px', 'paddingRight': '5px'}}>{el.remarks}</td>
                                                        </tr>
                                                    ))
                                                }
                                            </table>
                                        {/* </Grid> */}
                                        {/* <Grid item xs={12} sx={{position: 'absolute', top: window.innerHeight - 300, width: '25rem'}}> */}
                                            <Grid container spacing={2} sx={{position: 'absolute', top: window.innerHeight - 300, width: '25rem', marginTop: 5 }}>
                                                <Grid item xs={6}>
                                                    <Container>
                                                        <Grid container spacing={2}>
                                                            <Grid item sx={{textAlign: 'left'}}>
                                                                <Typography sx={{fontSize: 9, pb: 2}}>
                                                                    Submitted by:
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item sx={{textAlign: 'left'}}>
                                                                <Typography sx={{fontSize: 9, fontWeight: 'bold', textDecoration: 'underline'}}>
                                                                    {`${JSON.parse(localStorage.getItem('credentials'))['credentials']['first_name'].toUpperCase()} ${JSON.parse(localStorage.getItem('credentials'))['credentials']['last_name'].toUpperCase()}`}
                                                                </Typography>
                                                                <Typography sx={{fontSize: 9,}}>
                                                                    {jobTitle}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Container>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Container>
                                                        <Grid container spacing={2} sx={{marginLeft: box == true ? 0 : 30}}>
                                                            <Grid item sx={{textAlign: 'left'}}>
                                                                <Typography sx={{fontSize: 9, pb: 2}}>
                                                                    Noted by:
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item sx={{textAlign: 'left'}}>
                                                                <Typography sx={{fontSize: 9, fontWeight: 'bold', textDecoration: 'underline'}}>
                                                                    {`ROY ALBERT N. KAIMO`}
                                                                </Typography>
                                                                <Typography sx={{fontSize: 9}}>
                                                                    Project Chief Technical Specialist
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Container>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Container>
                                                        <Grid container spacing={2}>
                                                            <Grid item sx={{textAlign: 'left'}}>
                                                                <Typography sx={{fontSize: 9, pb: 1}}>
                                                                    Approved by:
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item sx={{textAlign: 'left'}}>
                                                                <Typography sx={{fontSize: 9, fontWeight: 'bold', textDecoration: 'underline'}}>
                                                                    {`DR. Teresito C. Bacolcol`}
                                                                </Typography>
                                                                <Typography sx={{fontSize: 9}}>
                                                                    Director, DOST-PHIVOLCS
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Container>
                                                </Grid>
                                            </Grid>

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
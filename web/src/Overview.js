import { Fragment, useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';


import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import ButtonGroup from '@mui/material/ButtonGroup';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SummarizeIcon from '@mui/icons-material/Summarize';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { KeyboardArrowUp } from "@mui/icons-material";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import Swal from 'sweetalert2'
import moment from 'moment';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));
  
  export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}

    interface TabPanelProps {
        children?: React.ReactNode;
        index: number;
        value: number;
    }
  
    function TabPanel(props: TabPanelProps) {
        const { children, value, index, ...other } = props;
    
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
                )}
            </div>
        );
    }

    function a11yProps(index: number) {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
    }

const IP_ADDR = "http://localhost:6969";

function BootstrapDialogTitle(props: DialogTitleProps) {
    const { children, onClose, ...other } = props;
    return (
      <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
  }
  

const Overview = () => {
    const [open, setOpen] = useState(false);
    const [asssignedTo, setAssignedTo] = useState([]);
    const [majorOutputList, setOutputList] = useState([]);
    const [currentTaskList, setTaskList] = useState([]);
    const [memberList, setMemberList] = useState([]);
    
    const [selectedMajorOutput, setSelectedMajorOutput] = useState(null);
    const [selectedMajorOutputValue, setSelectedMajorOutputValue] = useState('');
    const [assignedMemberValue, setAssignedMemberValue] =  useState('');
    const [outputDetails, setOutputDetails] = useState('');
    const [outputNotes, setOutputNotes] = useState('');
    const [runningTimerList, setRunningTimerList] = useState([]);

    const [isTL, setTL] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };

    const resetForm = () => {
        setAssignedTo([]);
        setOutputDetails('');
        setOutputNotes('');
        setSelectedMajorOutput(null);
    }

    const handleSave = () => {
        axios.post(`${IP_ADDR}/save_task`, {
            major_output: selectedMajorOutput,
            output_details: outputDetails,
            assigned_to: asssignedTo,
            output_notes: outputNotes,
            user_id: JSON.parse(localStorage.getItem('credentials'))['credentials']['user_id']
        })
        .then(function (response) {
            if (response.data.status == true) {
                handleClose();
                let timerInterval;
                Swal.fire({
                    icon: 'success',
                    title: 'Task Saved Successfully!',
                    text: response.data.message,
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
                    resetForm();
                    getTasks(tabValue);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.data.message,
                });
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    
    const trigger = useScrollTrigger({
        target: document.body,
        disableHysteresis: true,
        threshold: 100,
    });

    const scrollToTop = useCallback(() => {
        document.body.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const getTasks = (category) => {
        let user_id = JSON.parse(localStorage.getItem('credentials'))['credentials']['user_id'];
        axios.get(`${IP_ADDR}/get_tasks/${user_id}/${category}`)
        .then(function (response) {
            let origin_res = response.data.data;
            origin_res.forEach((element, index) => {
                axios.get(`${IP_ADDR}/get_task_activity/${element.output_id}`)
                .then(function (res) {
                    let temp_total = 0;
                    origin_res[index]['activity'] = res.data.data;
                    res.data.data.forEach(element => {
                        if (element.end_ts != null) {
                            let difference = moment.duration(moment(element.end_ts).diff(moment(element.start_ts)));
                            console.log(difference.asMinutes());
                            temp_total += parseInt(difference.asMinutes())
                        } else {
                            let temp = [...runningTimerList];
                            temp.push(element.output_id);
                            setRunningTimerList(temp);
                        }
                    });
                    origin_res[index]['total_time_spent'] = temp_total;
                });
            });
            
            setTimeout(()=> {
                console.log(origin_res);
                setTaskList(origin_res);
            }, 1000)
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // 
          });
    }

    const getMajorOutputList = () => {
        axios.get(`${IP_ADDR}/get_major_outputs`)
        .then(function (response) {
            setOutputList(response.data.data)
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // 
          });
    }

    const getUsers = () => {
        axios.get(`${IP_ADDR}/get_users`)
        .then(function (response) {
            setMemberList(response.data.data)
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // 
          });
    }

    const toggleTimer = (id) => {
        let temp = [...runningTimerList];
        let index = runningTimerList.indexOf(id);
        if (index == -1) {
            axios.post(`${IP_ADDR}/start_timer`, {output_id: id})
            .then(function (response) {
                if (response.data.status == true) {
                    temp.push(id)
                    setRunningTimerList(temp)
                } else {
                    
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        } else {
            axios.post(`${IP_ADDR}/stop_timer`, {output_id: id})
            .then(function (response) {
                if (response.data.status == true) {
                    temp.splice(index, 1);
                    setRunningTimerList(temp);
                    getTasks(tabValue);
                } else {
                    
                }
            })
            .catch(function (error) {
                console.log(error);
            });

        }
    }

    const submitTask = (element) => {
        if (runningTimerList.indexOf(element.output_id) == -1) {
            axios.post(`${IP_ADDR}/submit_task`, {output_id: element.output_id})
            .then(function (response) {
                if (response.data.status == true) {
                    let timerInterval;
                    Swal.fire({
                        icon: 'success',
                        title: 'Task Submitted!',
                        text: response.data.message,
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
                        getTasks(tabValue);
                    });
                } else {
                    
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Nag ru-run timer mo tapos mag ssubmit ka? Boba?',
            });
        }
    }

    useEffect(()=> {
        getTasks(tabValue);
        getMajorOutputList();
        getUsers();
    }, []);

    const timeConvert = (n) => {
        var num = n;
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        return `${rhours} hour${rhours > 1 ? 's': ''} and ${rminutes} minutes`;
    }

    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        getTasks(newValue)
    };

    return (
        <Fragment>
            <CssBaseline />
            <Container maxWidth="lg">
                <Grid container>
                    <Grid item xs={7} />
                    <Grid item xs={5}>
                        <FormControl variant="standard" sx={{ mb: 1, mt: 6, width: '100%', minWidth: '5ch' }}>
                            <Input
                                id="standard-adornment-search"
                                endAdornment={<SearchIcon position="end"></SearchIcon>}
                                aria-describedby="standard-search-helper-text"
                                inputProps={{
                                'aria-label': 'Search',
                                }}
                            />
                            <FormHelperText id="standard-search-helper-text">Search Tasks / Outputs / Date</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h4" style={{fontWeight: 500}}>List of tasks</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <ButtonGroup variant="text" aria-label="text button group">
                            <Button startIcon={<AddCircleOutlineIcon />} onClick={handleClickOpen}>Create a task</Button>
                            <Button startIcon={<AssessmentIcon />}>Generate latest RACI</Button>
                            <Button startIcon={<SummarizeIcon />}>Generate Monthly Accomplishment Report</Button>
                        </ButtonGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid item xs={12} sx={{pt:2, pr:2, pl:2}}>
                            <Tabs value={tabValue} onChange={handleChangeTab} aria-label="basic tabs example">
                                <Tab label="On-going" {...a11yProps(0)} />
                                <Tab label="Submitted" {...a11yProps(1)} />
                                <Tab label="Finished" {...a11yProps(2)} />
                                {
                                    isTL && <Tab sx={{color: 'green'}} label="Members Tasks" {...a11yProps(3)} />
                                }
                                {
                                    isTL && <Tab sx={{color: 'green'}} label="Submitted by Members" {...a11yProps(3)} />
                                }
                            </Tabs>
                        </Grid>
                        <Box sx={{ p: 2, mt: 2, mb: 2, 
                            boxShadow: 1, 
                            borderRadius: 2,
                            backgroundColor: 'grey',
                            minHeight: 400}}>
                            {
                                currentTaskList.length != 0 ?
                                    currentTaskList.map((element)=> (
                                        <Accordion>
                                            <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                            >
                                                <Grid container>
                                                    <Grid item xs={7}>
                                                        <Typography style={{fontWeight: 500}}>{element.major_output}</Typography>
                                                        <Typography variant="overline">{element.actual_outputs}</Typography>
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                        <Grid container sx={{textAlign: 'right', pt: 1}} justifyContent="flex-end">
                                                            <Grid item xs={4}>
                                                                <Button color={runningTimerList.indexOf(element.output_id) == -1 ? "primary" : "error"} startIcon={runningTimerList.indexOf(element.output_id) == -1 ? <PlayCircleOutlineIcon/> : <PauseCircleOutlineIcon />} onClick={()=> toggleTimer(element.output_id)}>
                                                                    {
                                                                        runningTimerList.indexOf(element.output_id) == -1 ? "Start Timer" : "Stop Timer"
                                                                    }
                                                                </Button>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <Button startIcon={<CheckCircleOutlineIcon/>} color="success" onClick={()=> submitTask(element)}>Submit Task</Button>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                            <Typography>
                                                {
                                                    element.details != "" && element.details != null ? 
                                                        element.details
                                                    :
                                                        <Typography>
                                                            <Box sx={{ fontStyle: 'italic', m: 1 }}>Wala kang nilagay na details. Kasalanan mo kung bakit ka nalilito kung ano tong task na to.</Box>
                                                        </Typography>
                                                }
                                            </Typography>
                                            <Typography variant="overline" sx={{fontWeight: 500}}>Nakaka {timeConvert(element.total_time_spent)} ka na. 🥬 {element.total_time_spent > 480 && 'Aba, bilisan mo mag work.'} </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))
                                :
                                    <Typography sx={{p: 2, color: 'white', textAlign: 'center'}}>
                                        No task(s) available 🥬 
                                    </Typography>
                            }
                        </Box>
                    </Grid>
                </Grid>
            </Container>
            <Zoom in={trigger}>
                <Box
                role="presentation"
                sx={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    zIndex: 1,
                }}
                >
                <Fab
                    onClick={scrollToTop}
                    color="primary"
                    size="small"
                    aria-label="scroll back to top"
                >
                    <KeyboardArrowUp />
                </Fab>
                </Box>
            </Zoom>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Create a task
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Container maxWidth="lg">
                        <Grid container spacing={2} sx={{minWidth: 200, maxWidth: 500, width: 500}}>
                            <Grid item xs={12}>
                                <Autocomplete
                                    id="output-autocomplete"
                                    freeSolo
                                    options={majorOutputList.map((option) => option.major_output)}
                                    renderInput={(params) => <TextField {...params} label="Task / Output" />}
                                    sx={{width: '100%'}}
                                    helperText="E.g. 2.2.1 EWS-L Monitoring Tools Maintenance"
                                    variant="outlined" 
                                    value={selectedMajorOutputValue}
                                    onChange={(event: any, newValue: string | null) => {
                                        if (newValue != null) {
                                         let output = majorOutputList.find(x => x.major_output === newValue);
                                         setSelectedMajorOutput(output)
                                        }
                                     }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    disablePortal
                                    id="member-list-combo"
                                    options={memberList.map((option) => option.fullname)}
                                    sx={{ width: '100%' }}
                                    renderInput={(params) => <TextField {...params} label="Search user(s)" />}
                                    label="Assign it to"
                                    helperText="Sino my kasalanan pag di nagawa ang task"
                                    variant="outlined"
                                    value={assignedMemberValue}
                                    onChange={(event: any, newValue: string | null) => {
                                       if (newValue != null) {
                                        let member = memberList.find(x => x.fullname === newValue);
                                        let temp = [...asssignedTo]
                                        if (temp.indexOf(member) == -1) {
                                            temp.push(member)
                                            setAssignedTo(temp);
                                        }
                                       }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                {
                                    asssignedTo.length == 0 ?
                                        <Typography sx={{p: 2}}>
                                            No assigned person(s) yet
                                        </Typography>
                                    :
                                        <div>
                                            <Typography sx={{p: 2}}>
                                                Assigned to: 
                                            </Typography>
                                           {
                                             asssignedTo.map((el)=> (
                                                <Chip label={el.fullname} onDelete={()=> {}} />
                                            ))
                                           }
                                        </div>
                                }
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    sx={{width: '100%'}}
                                    id="filled-helperText"
                                    label="Output Title"
                                    defaultValue=""
                                    helperText="Title ng output (Sa tagalog, Kung ano tawag sa ginagawa mo)"
                                    variant="outlined"
                                    value={outputDetails}
                                    onChange={(e) => setOutputDetails(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    sx={{width: '100%'}}
                                    id="filled-helperText"
                                    label="Output details"
                                    defaultValue=""
                                    multiline
                                    rows={5}
                                    helperText="Details ng output ilagay mo dito. Bawal blanko."
                                    variant="outlined"
                                    value={outputNotes}
                                    onChange={(e) => setOutputNotes(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </DialogContent>
                <DialogActions>
                <Button autoFocus color="error" onClick={() => {
                    console.log("RESET")
                }}>
                    Reset form
                </Button>
                <Button autoFocus onClick={handleSave}>
                    Save changes
                </Button>
                </DialogActions>
            </BootstrapDialog>
        </Fragment>
    )
}

export default Overview;
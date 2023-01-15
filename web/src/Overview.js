import { Fragment, useCallback, useEffect, useState } from 'react';
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SummarizeIcon from '@mui/icons-material/Summarize';

import { KeyboardArrowUp } from "@mui/icons-material";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

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

    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };

    const handleSave = () => {
        console.log("ASSIGNED TO:", asssignedTo);
        console.log("outputDetails:", outputDetails);
        console.log("selectedMajorOutput:", selectedMajorOutput);
    }
    
    const trigger = useScrollTrigger({
        target: document.body,
        disableHysteresis: true,
        threshold: 100,
    });

    const scrollToTop = useCallback(() => {
        document.body.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const getTasks = () => {
        let user_id = JSON.parse(localStorage.getItem('credentials'))['credentials']['user_id'];
        axios.get(`http://localhost:6969/get_tasks/${user_id}`)
        .then(function (response) {
            // console.log(response.data);
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
        axios.get(`http://localhost:6969/get_major_outputs`)
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
        axios.get(`http://localhost:6969/get_users`)
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

    useEffect(()=> {
        getTasks();
        getMajorOutputList();
        getUsers();
    }, []);

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
                        <Box sx={{ p: 2, mt: 2, mb: 2, 
                            boxShadow: 1, 
                            borderRadius: 2,
                            backgroundColor: 'grey',
                            minHeight: 400}}>
                            {
                                currentTaskList.length != 0 ?
                                    currentTaskList.map(()=> (
                                        <Accordion>
                                            <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                            >
                                                <Grid container>
                                                    <Grid item xs={7}>
                                                        <Typography style={{fontWeight: 500}}>2.2.1 EWS-L Monitoring Tools Maintenance</Typography>
                                                        <Typography variant="overline">Update python version</Typography>
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                        <Grid container sx={{textAlign: 'right', pt: 1}} justifyContent="flex-end">
                                                            <Grid item xs={4}>
                                                                <Button startIcon={<PlayCircleOutlineIcon/>}>Start timer</Button>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <Button startIcon={<CheckCircleOutlineIcon/>} color="success">Mark as done</Button>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                            <Typography>
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                                                malesuada lacus ex, sit amet blandit leo lobortis eget.
                                            </Typography>
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
                                        temp.push(member)
                                        setAssignedTo(temp);
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
                                    label="Output details"
                                    defaultValue=""
                                    multiline
                                    rows={5}
                                    helperText="Details ng output ilagay mo dito. Bawal blanko."
                                    variant="outlined"
                                    value={outputDetails}
                                    onChange={(e) => setOutputDetails(e.target.value)}
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
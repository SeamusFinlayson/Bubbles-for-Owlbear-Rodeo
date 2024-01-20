import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function RowRadioButtonsGroup() {
    return (
        <FormControl>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
            >

            <FormControlLabel value="damage" control={<Radio />} label="" />
            <FormControlLabel value="healing" control={<Radio />} label=""/>

            </RadioGroup>
        </FormControl>
    );
}
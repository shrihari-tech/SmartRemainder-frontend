import * as React from 'react';
import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { BiSolidFolderMinus, BiSolidMessageSquareDots } from "react-icons/bi";


function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isSelected = !props.outsideCurrentMonth && highlightedDays.includes(day.date());

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isSelected ? <BiSolidMessageSquareDots className="text-red-700 text-xl"/> : undefined}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      sx={{
        '& .MuiBadge-badge': {
          transform: 'translate(-50%, -50%)', // Center the badge
          top: '10%',
          left: '69%',
        },
      }}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} className="bg-[#5e10a296]"
        sx={{
          '&.Mui-selected': {
            backgroundColor: '#5e10a296',
            '&:hover': {
              backgroundColor: '#5e10a296',
            },
          },
        }}
      />
    </Badge>
  );
}

const initialValue = dayjs();

export default function DateCalendarServerRequest({ tasks }) {
  const requestAbortController = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [highlightedDays, setHighlightedDays] = React.useState([]);

  const fetchHighlightedDays = (date) => {
    const controller = new AbortController();
    const formattedDate = date.format('YYYY-MM');
    const daysToHighlight = tasks
      // .filter(task => task.end_date.startsWith(formattedDate))
      .filter(task => task.end_date && task.end_date.startsWith(formattedDate))
      .map(task => dayjs(task.end_date).date());

    setHighlightedDays(daysToHighlight);
    setIsLoading(false);

    requestAbortController.current = controller;
  };

  React.useEffect(() => {
    fetchHighlightedDays(initialValue);
    return () => requestAbortController.current?.abort();
  }, [tasks]);

  const handleMonthChange = (date) => {
    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    setHighlightedDays([]);
    fetchHighlightedDays(date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        defaultValue={initialValue}
        loading={isLoading}
        onMonthChange={handleMonthChange}
        renderLoading={() => <DayCalendarSkeleton />}
        slots={{
          day: ServerDay,
        }}
        slotProps={{
          day: {
            highlightedDays,
          },
        }}
      />
    </LocalizationProvider>
  );
}
const API_KEY = '';
const CALENDAR_ID = '';
const timePickers = document.querySelectorAll('.time-picker')
const timePickerInput = document.querySelector('.time-picker-input');


timePickers.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        timePickerInput.value = btn.innerHTML;
        timePickers.forEach(btn => btn.classList.remove('active'));
        timePickers.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
    })
})

function gapiLoaded () {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    });

    const events = await listUpcomingEvents();
    const reservedDates = [];
    const availableTimes = [
        {start: 10, end: 12},
        {start: 13, end: 15},
        {start: 16, end: 16},
    ]
    const filteredEvents = [];

    if (events) {
        events.forEach(event => {
            if (event.start.date) {
                const date = new Date(event.start.date);
                reservedDates.push(date.getDate());
            } else {
                filteredEvents.push(event)
            }
        })
    }

    new AirDatepicker('#el', {
        locale: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            today: 'Today',
            clear: 'Clear',
            dateFormat: 'MM/dd/yyyy',
            timeFormat: 'hh:mm aa',
            firstDay: 0
        },
        selectedDates: [new Date()],
        position: 'top center',
        autoClose: true,
        dateFormat(date) {
            return date.toLocaleString('en', {
                year: 'numeric',
                day: '2-digit',
                month: 'long',
            });
        },
        onRenderCell({ date, cellType }) {
            if (cellType === 'day') {
                const today = new Date(); // текущая дата
                today.setHours(0, 0, 0, 0); // убираем время для точного сравнения

                if (date < today || reservedDates.includes(date.toISOString().split('T')[0])) {
                    return {
                        disabled: true,
                    };
                }
            }
        }
        ,
        onSelect({date}) {
            filteredEvents.forEach(event => {
                const startTime = new Date(event.start.dateTime).getHours();
                const endTime = new Date(event.end.dateTime).getHours();
                if (date.getDate() === new Date(event.start.dateTime).getDate()) {
                    availableTimes.forEach((item, index) => {
                        if (item.start < endTime && startTime < item.end) {
                            timePickers[index].disabled = true;
                        }
                    })
                }
            })
        }
    });
}

async function listUpcomingEvents() {
    let response;
    try {
        const request = {
            'calendarId': CALENDAR_ID,
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime',
        };
        response = await gapi.client.calendar.events.list(request);
    } catch (err) {
        console.log(err.message)
        return;
    }

    events = response.result.items;
    if (!events || events.length === 0) {
        console.log('No events found')
        return;
    }
    return events
}

export function formatSchedule(schedule: any) {
    const result: any = {};

    Object.entries(schedule).forEach(([day, value]: any) => {
        if (!value) {
            result[day] = { aberto: false };
        } else {
            result[day] = {
                aberto: true,
                inicio: `${value.open.padStart(2, "0")}:00`,
                fim: `${value.close.padStart(2, "0")}:00`   
            };
        }
    });

    return result;
} 
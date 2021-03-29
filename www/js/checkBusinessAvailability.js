const { getYear, getMonth } = require("date-fns");
const { getConnection } = require("../../db");
const { formatDateToDB, daysInMonth } = require("../../helpers");

async function checkBusinessAvailability(req, res, next) {
	let connection;

	try {
		//OBTENEMOS ID DEL NEGOCIO
		const { idBusiness } = req.params;
		//OBTENEMOS MES DE CONSULTA
		const { checkInMonth } = req.query;
		//OBTENEMOS INFO DEL NEGOCIO
		const [infoBusiness] = await connection.query(
			`
        SELECT opening_time, closing_time, allotment, length_booking
        FROM business
        WHERE id=?`,
			[idBusiness]
		);

		//VARIABLES DEL NEGOCIO
		const allotment = infoBusiness[0].allotment;
		const openingTime = infoBusiness[0].opening_time;
		const closingTime = infoBusiness[0].closing_time;
		const lengthBooking = infoBusiness[0].length_booking;

		//VARIABLES DE FECHA POR DEFECTO
		const date = new Date();
		const monthByDefault = getMonth(date);
		const year = getYear(date);
		const monthByDefaultToDays = Number(monthByDefault) + 1;
		const daysMonthDefault = daysInMonth(monthByDefaultToDays, year);

		//VARIABLES DE FECHA SI USUARIO ESCOGE MES
		const checkDaysMonth = Number(checkInMonth) + 1;
		const daysMonth = daysInMonth(checkDaysMonth, year);

		//CREAR VARIABLES PARA MODIFICAR A FUTURO EN BUCLES
		const monthTimes = [];
		let bookingTimes = [];

		//DOS CASOS - USUARIO ESCOGE MES Y MES POR DEFECTO
		if (checkInMonth) {
			//BUCLE QUE RECORRERÁ TODOS LOS DÍAS DEL MES
			for (let j = 1; j < daysMonth; j++) {
				date.setMonth(checkInMonth);
				date.setDate(j);
				let checkInDayDB = formatDateToDB(date);

				if (lengthBooking === 30) {
					let iPlusLength = 0.5;

					const [isOpen] = await connection.query(
						`
                    SELECT name
                    FROM business BU LEFT OUTER JOIN opening_days OD ON BU.id = OD.id_business
                    WHERE BU.id = ?
                    AND (WEEKDAY(?)+1) IN (SELECT day FROM opening_days OD WHERE OD.id_business = BU.ID)
                    group bY name`,
						[idBusiness, checkInDayDB]
					);

					if (isOpen.length > 0) {
						const [result] = await connection.query(
							`
                        select check_in_day, HOUR(check_in_time) as check_in_time, MINUTE(check_in_time) as minutes, COUNT(BO.id) AS bookings, 
                        BU.allotment_available AS allotment, CONCAT(COUNT(BO.id)/BU.allotment_available * 100, '%') as occ 
                        FROM business BU, booking BO
                        WHERE BU.id = BO.id_business AND BU.id=? AND check_in_day = ? AND NOT BO.status = 'CANCELADO'
                        GROUP BY check_in_day, check_in_time;`,
							[idBusiness, checkInDayDB]
						);

						for (
							let i = Number(openingTime);
							i < closingTime;
							i += plusLength
						) {
							if (Number.isInteger(i)) {
								const current = result.find((r) => r.check_in_time === i);
								if (current) {
									bookingTimes.push(current);
								} else {
									bookingTimes.push({
										check_in_day: checkInDayDB,
										check_in_time: i,
										minutes: "00",
										bookings: 0,
										allotment: allotment,
										occ: "00.0000%",
									});
								}
							} else {
								let hour = i - iPlusLength;
								const current = result.find(
									(r) => r.check_in_time === hour && r.minutes === iPlusLength
								);
								if (current) {
									bookingTimes.push(current);
								} else {
									bookingTimes.push({
										check_in_day: checkInDayDB,
										check_in_time: hour,
										minutes: lengthBooking,
										bookings: 0,
										allotment: allotment,
									});
								}
							}
						}
						let totalBookings = bookingTimes.reduce((accumulator, slotTime) => {
							return accumulator + slotTime.booking;
						}, 0);
						let totalAvailable = bookingTimes.reduce(
							(accumulator, slotTime) => {
								return accumulator + slotTime.allotment;
							},
							0
						);
						let occupancy =
							(totalBookings / totalAvailable).toFixed(2) * 100 + "%";

						let summaryDaily = {
							day: checkInDayDB,
							totalBookings: totalBookings,
							totalAvailable: totalAvailable,
							occ: occupancy,
						};
						monthTimes.push(summaryDaily);
						bookingTimes = [];
					}
				} else {
					const [isOpen] = await connection.query(
						`
                    SELECT name
                    FROM business BU LEFT OUTER JOIN opening_days OD ON BU.id = OD.id_business
                    WHERE BU.id = ?
                    AND (WEEKDAY(?)+1) IN (SELECT day FROM opening_days OD WHERE OD.id_business = BU.ID)
                    group bY name`,
						[idBusiness, checkInDayDB]
					);

					if (isOpen.length > 0) {
						const [result] = await connection.query(
							`
                        select check_in_day, HOUR(check_in_time) as check_in_time, COUNT(BO.id) AS bookings, 
                        BU.allotment_available AS allotment, CONCAT(COUNT(BO.id)/BU.allotment_available * 100, '%') as occ 
                        FROM business BU, booking BO
                        WHERE BU.id = BO.id_business AND BU.id=? AND check_in_day = ? AND NOT BO.status = 'CANCELADO' 
                        GROUP BY check_in_day, check_in_time;`,
							[idBusiness, checkInDayDB]
						);
						for (let i = Number(openingTime); i < closingTime; i++) {
							const current = result.find((r) => r.check_in_time === i);
							if (current) {
								bookingTimes.push(current);
							} else {
								bookingTimes.push({
									check_in_day: checkInDayDB,
									check_in_time: i,
									minutes: "00",
									bookings: 0,
									allotment: allotment,
									occ: "00.0000%",
								});
							}
						}
						const totalBookings = bookingTimes.reduce(
							(accumulator, slotTime) => {
								return accumulator + slotTime.bookings;
							},
							0
						);
						const totalAvailable = bookingTimes.reduce(
							(accumulator, slotTime) => {
								return accumulator + slotTime.allotment;
							},
							0
						);
						const occupancy =
							(totalBookings / totalAvailable).toFixed(2) * 100 + "%";

						const summaryDaily = {
							day: checkInDayDB,
							totalBookings: totalBookings,
							totalAvailable: totalAvailable,
							occ: occupancy,
						};
						monthTimes.push(summaryDaily);
						bookingTimes = [];
					}
				}
			}
			const totalBookings = monthTimes.reduce((accumulator, slotTime) => {
				return accumulator + slotTime.totalBookings;
			}, 0);
			const totalAvailable = monthTimes.reduce((accumulator, slotTime) => {
				return accumulator + slotTime.totalAvailable;
			}, 0);
			const occupancy = (totalBookings / totalAvailable).toFixed(2) * 100 + "%";

			const summaryMonthly = {
				month: checkDaysMonth,
				totalBookings: totalBookings,
				totalAvailable: totalAvailable,
				occ: occupancy,
			};

			res.send({
				status: "ok",
				data: monthTimes,
				summary: summaryMonthly,
			});
		} else {
		}
	} catch (error) {
		next(error);
	}
}

module.exports = checkBusinessAvailability;

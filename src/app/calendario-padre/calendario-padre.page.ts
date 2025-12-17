import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReunionesService, Reunion } from '../services/reuniones.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-calendario-padre',
  templateUrl: './calendario-padre.page.html',
  styleUrls: ['./calendario-padre.page.scss'],
})
export class CalendarioPadrePage implements OnInit, OnDestroy {

  userDocID!: string;
  notificationCount = 0;

  displayedMonth!: number;
  displayedYear!: number;

  weekDays = [
    'Domingo', 'Lunes', 'Martes',
    'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  calendarDays: {
    day: number;
    dayName: string;
    events: Reunion[];
  }[] = [];

  reunionesSub?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reunionesService: ReunionesService
  ) {}

  // ======================================
  // INIT
  // ======================================
  ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log('[Calendario Padre] userDocID:', this.userDocID);

    const now = new Date();
    this.displayedMonth = now.getMonth();
    this.displayedYear = now.getFullYear();

    this.loadCalendar();
  }

  // ======================================
  // CARGAR CALENDARIO (SOLO REUNIONES DEL PADRE)
  // ======================================
  loadCalendar() {
    this.reunionesSub?.unsubscribe();

    this.reunionesSub = this.reunionesService
      .obtenerReunionesPorParticipante(this.userDocID)
      .subscribe(reuniones => {
        const mesStr = String(this.displayedMonth + 1).padStart(2, '0');
        const inicio = `${this.displayedYear}-${mesStr}-01`;
        const fin = `${this.displayedYear}-${mesStr}-31`;

        const reunionesDelMes = reuniones.filter(r =>
          r.fecha >= inicio && r.fecha <= fin
        );

        console.log('[Calendario Padre] Reuniones del mes:', reunionesDelMes);

        this.generateCalendar(reunionesDelMes);
      });
  }

  // ======================================
  // GENERAR DÍAS DEL CALENDARIO
  // ======================================
  generateCalendar(reuniones: Reunion[]) {
    const daysInMonth = new Date(
      this.displayedYear,
      this.displayedMonth + 1,
      0
    ).getDate();

    this.calendarDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.displayedYear, this.displayedMonth, day);
      const dayName = this.weekDays[date.getDay()];

      const fechaStr = `${this.displayedYear}-${String(this.displayedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const eventosDelDia = reuniones.filter(r => r.fecha === fechaStr);

      this.calendarDays.push({
        day,
        dayName,
        events: eventosDelDia
      });
    }
  }

  // ======================================
  // NAVEGACIÓN A RECORDATORIO PADRE
  // ======================================
  goToRecordatorio(day: number) {
    const fechaStr = `${this.displayedYear}-${String(this.displayedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    this.router.navigate(
      ['/', this.userDocID, 'recordatorio-padre'],
      { queryParams: { fecha: fechaStr } }
    );
  }

  // ======================================
  // CAMBIO DE MES
  // ======================================
  nextMonth() {
    if (this.displayedMonth === 11) {
      this.displayedMonth = 0;
      this.displayedYear++;
    } else {
      this.displayedMonth++;
    }
    this.loadCalendar();
  }

  prevMonth() {
    if (this.displayedMonth === 0) {
      this.displayedMonth = 11;
      this.displayedYear--;
    } else {
      this.displayedMonth--;
    }
    this.loadCalendar();
  }

  // ======================================
  // NAVEGACIÓN GENERAL
  // ======================================
  goBack() {
    this.router.navigate(['/', this.userDocID, 'menu-principal-padre']);
  }

  goNotificaciones() {
    this.router.navigate(['/', this.userDocID, 'notificaciones-padre']);
  }

  ngOnDestroy() {
    this.reunionesSub?.unsubscribe();
  }
}

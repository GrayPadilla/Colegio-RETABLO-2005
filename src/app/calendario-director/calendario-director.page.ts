import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReunionesService, Reunion } from '../services/reuniones.service';
import { Subscription } from 'rxjs';
import { IonHeader } from "@ionic/angular/standalone";

@Component({
  standalone: false,
  selector: 'app-calendario',
  templateUrl: './calendario-director.page.html',
  styleUrls: ['./calendario-director.page.scss'],
})
export class CalendarioDirectorPage implements OnDestroy {

  userDocID!: string;
  notificationCount = 0; // muestra badge si lo usas

  displayedMonth: number;
  displayedYear: number;

  weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
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
  ) {
    // obtener userDocID desde la ruta (consistente con otras pantallas)
    this.userDocID = this.route.snapshot.paramMap.get('id')!;

    const now = new Date();
    this.displayedMonth = now.getMonth();
    this.displayedYear = now.getFullYear();

    this.loadCalendar();
  }

  // cargar reuniones del mes y generar calendario
  loadCalendar() {
    this.reunionesSub?.unsubscribe();
    this.reunionesSub = this.reunionesService
      .getReunionesPorMes(this.displayedYear, this.displayedMonth)
      .subscribe(reuniones => {
        console.log('[Calendario] reuniones recibidas:', reuniones); // <-- útil para debug
        this.generateCalendar(reuniones);
      });
  }

  generateCalendar(reuniones: Reunion[]) {
    const daysInMonth = new Date(this.displayedYear, this.displayedMonth + 1, 0).getDate();
    this.calendarDays = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.displayedYear, this.displayedMonth, i);
      const dayName = this.weekDays[date.getDay()];
      const fechaStr = `${this.displayedYear}-${String(this.displayedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

      const eventosDelDia = reuniones.filter(r => r.fecha === fechaStr);

      this.calendarDays.push({
        day: i,
        dayName,
        events: eventosDelDia
      });
    }
  }

  // navegar al recordatorio con fecha YYYY-MM-DD y userDocID en la ruta
  goToRecordatorio(dia: number) {
    const year = this.displayedYear;
    const month = String(this.displayedMonth + 1).padStart(2, '0');
    const day = String(dia).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`; // e.g. 2025-06-13

    this.router.navigate(
      ['/', this.userDocID, 'recordatorio-director'],
      { queryParams: { fecha: fechaStr } }
    );
  }

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

  goBack() {
    // vuelve a la ruta anterior manteniendo userDocID si lo quieres
    this.router.navigate(['/', this.userDocID, 'menu-principal']);
  }

  goNotificaciones() {
    this.router.navigate(['/', this.userDocID, 'notificaciones-director']);
  }

  ngOnDestroy() {
    this.reunionesSub?.unsubscribe();
  }
}

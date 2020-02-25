import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GateExitLogDetails, ReportFilters } from 'app/models/reports';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDatepickerInputEvent } from '@angular/material';
import { Router } from '@angular/router';
import { ReportService } from 'app/services/report.service';
import { DatePipe } from '@angular/common';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';

@Component({
  selector: 'app-gate-exit-log',
  templateUrl: './gate-exit-log.component.html',
  styleUrls: ['./gate-exit-log.component.scss']
})
export class GateExitLogComponent implements OnInit {
  AllGateExitLogDetails: GateExitLogDetails[] = [];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  SetIntervalID: any;
  reportFormGroup: FormGroup;
  AllEwaybillNos: string[] = [];
  AllPlants: string[] = [];
  reportFilters: ReportFilters;
  diagramShow = true;
  content1Show = false;
  content1ShowName: string;
  // tslint:disable-next-line:max-line-length
  displayedColumns: string[] = [ 'InvoiceNumber', 'EWayBillNumber', 'ReferecneNO', 'Status', 'QRCodeScanTime','CREATED_ON'];
  dataSource: MatTableDataSource<GateExitLogDetails>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isDateError: boolean;

  constructor(
    private _router: Router,
    public snackBar: MatSnackBar,
    private _reportService: ReportService,
    private _formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
    this.reportFormGroup = this._formBuilder.group({
      EWAYBILL_NO: [''],
      FROMDATE: [''],
      TODATE: [''],
    });
    this.isDateError = false;
  }


  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
    } else {
      this._router.navigate(['/auth/login']);
    }

    this.GetAllEwaybillNos();
    this.GetAllGateExitLogs();
    // this.SetIntervalID = setInterval(() => {
    //   this.GetAllGateExitLogs();
    // }, 3000);

  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    if (this.SetIntervalID) {
      clearInterval(this.SetIntervalID);
    }
  }

  // tslint:disable-next-line:typedef
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  @ViewChild('TABLE') table: ElementRef;

  GetAllEwaybillNos(): void {
    this._reportService.GetAllEwaybillNos(this.authenticationDetails.userID).subscribe((data) => {
      if (data) {
        this.AllEwaybillNos = data as string[];
      }
    },
      (err) => {
        console.log(err);
      });
  }

  GetAllGateExitLogs(): void {
    this._reportService.GetAllGateExitLogs(this.authenticationDetails.userID).subscribe(
      (data) => {
        this.AllGateExitLogDetails = data as GateExitLogDetails[];
        //console.log(this.AllGateExitLogDetails);
        if (this.AllGateExitLogDetails.length > 0) {
          this.dataSource = new MatTableDataSource(this.AllGateExitLogDetails);
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'TAT': {
                return item.TAT_TIMESPAN_VAL;
              }
              default: {
                return item[property];
              }
            }
          };
          console.log(this.AllGateExitLogDetails);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.log(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetAllGateExitLogsBasedOnFilter(): void {
    if (this.reportFormGroup.valid) {
      if (!this.isDateError) {
      this.IsProgressBarVisibile = true;
      const EWAYBILL_NO: string = this.reportFormGroup.get('EWAYBILL_NO').value;
      // const PLANT: string = this.reportFormGroup.get('PLANT').value;
      // const FROMDATE = this.datePipe.transform(this.reportFormGroup.get('FROMDATE').value as Date, 'yyyy-MM-dd');
      // const TODATE = this.datePipe.transform(this.reportFormGroup.get('TODATE').value as Date, 'yyyy-MM-dd');
      const USERID: number = this.authenticationDetails.userID;
      this.reportFilters = new ReportFilters();
      this.reportFilters.UserID = USERID;
      this.reportFilters.EWAYBILL_NO = EWAYBILL_NO;
      // this.reportFilters.PLANT = PLANT;
      this.reportFilters.FROMDATE = this.datePipe.transform(this.reportFormGroup.get('FROMDATE').value as Date, 'yyyy-MM-dd');;
      this.reportFilters.TODATE = this.datePipe.transform(this.reportFormGroup.get('TODATE').value as Date, 'yyyy-MM-dd');;
      // tslint:disable-next-line:max-line-length
      if ((this.reportFilters.EWAYBILL_NO !== '' && this.reportFilters.EWAYBILL_NO !== null) && ((this.reportFilters.FROMDATE === '' && this.reportFilters.TODATE === '') || (this.reportFilters.FROMDATE === null && this.reportFilters.TODATE === null))) {
        // this.authenticationDetails.userID, EWAYBILL_NO, FROMDATE, TODATE
        this._reportService.GetAllGateExitLogsBasedOnEwaybillNoFilter(this.reportFilters)
          .subscribe((data) => {
            this.AllGateExitLogDetails = data as GateExitLogDetails[];
            this.dataSource = new MatTableDataSource(this.AllGateExitLogDetails);
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'TAT': {
                  console.log('Inside TAT');
                  return item.TAT_TIMESPAN_VAL;
                }
                default: {
                  console.log('Inside default sort');
                  return item[property];
                }
              }
            };
            this.dataSource.paginator = this.paginator;
            // this.dataSource.paginator.pageSizeOptions=[10, 20,50, this.AllGateExitLogDetails.length];
            this.dataSource.paginator.pageSize = this.AllGateExitLogDetails.length;
            this.dataSource.sort = this.sort;
            // }
            this.IsProgressBarVisibile = false;
          },
            (err) => {
              console.log(err);
            });
      }
      // tslint:disable-next-line:max-line-length
      else if ((this.reportFilters.EWAYBILL_NO === '' || this.reportFilters.EWAYBILL_NO === null) && ((this.reportFilters.FROMDATE !== '' && this.reportFilters.TODATE !== '') && (this.reportFilters.FROMDATE !== null && this.reportFilters.TODATE !== null))) {
        // this.authenticationDetails.userID, EWAYBILL_NO, FROMDATE, TODATE
        this._reportService.GetAllGateExitLogsBasedOnDateFilter(this.reportFilters)
          .subscribe((data) => {
            this.AllGateExitLogDetails = data as GateExitLogDetails[];
            this.dataSource = new MatTableDataSource(this.AllGateExitLogDetails);
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'TAT': {
                  return item.TAT_TIMESPAN_VAL;
                }
                default: {
                  return item[property];
                }
              }
            };
            this.dataSource.paginator = this.paginator;
            // this.dataSource.paginator.pageSizeOptions=[10, 20,50, this.AllGateExitLogDetails.length];
            this.dataSource.paginator.pageSize = this.AllGateExitLogDetails.length;
            this.dataSource.sort = this.sort;
            this.IsProgressBarVisibile = false;
          },
            (err) => {
              console.log(err);
            });
      }
      else {
        this.notificationSnackBarComponent.openSnackBar('It requires at least a field or From Date and To Date', SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    }
  }
    else{
      Object.keys(this.reportFormGroup.controls).forEach(key => {
        this.reportFormGroup.get(key).markAsTouched();
        this.reportFormGroup.get(key).markAsDirty();
      });
    }
   
    //this.reportFormGroup.reset();
  }

  clearFromToDateAndEwaybillNo(): void {
    this.reportFormGroup.get('FROMDATE').patchValue('');
    this.reportFormGroup.get('TODATE').patchValue('');
    this.reportFormGroup.get('EWAYBILL_NO').patchValue('');
  }

  clearFromToDateAndPlant(): void {
    this.reportFormGroup.get('FROMDATE').patchValue('');
    this.reportFormGroup.get('TODATE').patchValue('');
    // this.reportFormGroup.get('PLANT').patchValue('');
  }

  // addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
  //   this.reportFormGroup.get('EWAYBILL_NO').patchValue('');
  //   // this.reportFormGroup.get('PLANT').patchValue('');
  // }
  DateSelected(): void {
    const FROMDATEVAL = this.reportFormGroup.get('FROMDATE').value as Date;
    const TODATEVAL = this.reportFormGroup.get('TODATE').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }

}

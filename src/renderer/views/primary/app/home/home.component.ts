import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { AppState } from '../state/app.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @Select(AppState.selectTitle) title$: Observable<string>;

  constructor() { }

  ngOnInit(): void { }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-new-profile-dialog',
  templateUrl: './new-profile-dialog.component.html',
  styleUrls: ['./new-profile-dialog.component.scss'],
})
export class NewProfileDialogComponent implements OnInit {
  @ViewChild('profileForm', { static: true }) formElem: FormGroupDirective;
  form: FormGroup;

  profiles: Observable<string[]>;

  constructor(private fb: FormBuilder, private dialog: DialogService) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      copyFrom: '',
    });

    this.dialog.dialogReady();

    this.dialog.dialogInput.subscribe((profiles) => {
      this.profiles = profiles;
    });
  }

  createProfile() {
    if (this.form.invalid) return;
    this.dialog.closeDialog(this.form.value);
  }

  getTooltip() {
    return `Create ${this.form.get('name').value || 'Profile'}`;
  }
}

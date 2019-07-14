import { Component } from '@angular/core';
import {MatDatepickerInputEvent, MatOption, MatSelectChange} from "@angular/material";
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {stringify} from "querystring";
import {forEach} from "@angular/router/src/utils/collection";

export interface Food {
  value: string;
  viewValue: string;
}

export interface Website {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  countryPriceMap = new Map<string, number[]>();
  countryAveragePriceMap = new Map<string, number>();
  events: string;
  website: string;
  allWebsites = new Set();

  countriesSet = new Set();
  countries: string[] = [];

  avgPrice: number[] = [];


  constructor(private httpClient: HttpClient){
  }

  get_all_websites(){
    let self = this;
    let httpHeaders = new HttpHeaders().set('Accept', 'application/json');
    let httpParams = new HttpParams().set('date', this.events);

    this.httpClient.get( 'http://localhost:1080/getwebsites', {headers: httpHeaders, params: httpParams, responseType: 'json'}).subscribe((res)=>{
      res["msg"].forEach(function(value){
        //console.log(value["_source"]["areaServed"][0]["addressCountry"]);
        //self.countries.push(value["_source"]["areaServed"][0]["addressCountry"]);
        //console.log(value["_source"]["areaServed"][0]["priceStatus"]["currentPrice"]);
        //self.avgPrice.push(value["_source"]["areaServed"][0]["priceStatus"]["currentPrice"]);

        //self.countryPriceMap.set(value["_source"]["areaServed"][0]["addressCountry"], value["_source"]["areaServed"][0]["priceStatus"]["currentPrice"]);

        console.log(value["_source"]["isBasedOnUrlObject"]["id"]);

        self.allWebsites.add(value["_source"]["isBasedOnUrlObject"]["id"]);

      });

    });

  }

  get_average_prices(){
    let self = this;
    let httpHeaders = new HttpHeaders().set('Accept', 'application/json');
    let httpParams = new HttpParams().set('date', this.events).set('website', this.website);

    this.httpClient.get( 'http://localhost:1080/averageprices', {headers: httpHeaders, params: httpParams, responseType: 'json'}).subscribe((res)=>{
      console.log(res);
      res["msg"].forEach(function(value){
        //console.log(value["_source"]["areaServed"][0]["addressCountry"]);
        //self.countries.push(value["_source"]["areaServed"][0]["addressCountry"]);
        //console.log(value["_source"]["areaServed"][0]["priceStatus"]["currentPrice"]);
        //self.avgPrice.push(value["_source"]["areaServed"][0]["priceStatus"]["currentPrice"]);

        //self.countryPriceMap.set(value["_source"]["areaServed"][0]["addressCountry"], value["_source"]["areaServed"][0]["priceStatus"]["currentPrice"]);

        if(self.countryPriceMap[value["_source"]["areaServed"][0]["addressCountry"]] && self.countryPriceMap[value["_source"]["areaServed"][0]["addressCountry"]].size <= 0 || self.countryPriceMap[value["_source"]["areaServed"][0]["addressCountry"]] == null) {
          self.countryPriceMap[value["_source"]["areaServed"][0]["addressCountry"]] = [];
        } else {
          self.countryPriceMap[value["_source"]["areaServed"][0]["addressCountry"]].push(value["_source"]["areaServed"][0]["priceStatus"]["currentPrice"]);
        }



      });

      for( let key in self.countryPriceMap){
        let size = self.countryPriceMap[key].length;
        let sum = 0;
        self.countryPriceMap[key].forEach(function(value){
          sum += value;
        });

        self.countryAveragePriceMap[key] = sum/size;

      }


      for(let key in self.countryAveragePriceMap){
        self.countriesSet.add(key);
        if( !isNaN(self.countryAveragePriceMap[key])){
          self.avgPrice.push(self.countryAveragePriceMap[key]);
        }
      }

      self.countriesSet.forEach(function(value){
        self.countries.push(value)
      });

    });
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    let current_date = event.value;
    let date_raw = current_date.getDate();
    let date_str = date_raw < 10 ? "0" + date_raw : date_raw;
    let month_raw = current_date.getMonth()+1;
    let month_str = month_raw < 10 ? "0" + month_raw : month_raw;
    let year = current_date.getFullYear();
    this.events = date_str + "." + month_str + "." + year;
    console.log(this.events);
    this.get_all_websites()
  }

  changeClient(value) {
    this.website = value;
    console.log(value);
  }

  title = 'RPE Client';
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];





  public graph = {
    data: [
      { x: this.avgPrice, y: this.countries, type: 'scatter', mode: 'markers', marker:  {
          color: 'rgba(156, 165, 196, 0.95)',
          line: {
            color: 'rgba(156, 165, 196, 1.0)',
            width: 1,
          },
          symbol: 'circle',
          size: 14
        } },
    ],
    layout: {
      title: 'Average Prices for Countries',
      xaxis: {
        showgrid: false,
        showline: true,
        linecolor: 'rgb(102, 102, 102)',
        titlefont: {
          font: {
            color: 'rgb(204, 204, 204)'
          }
        },
        tickfont: {
          font: {
            color: 'rgb(102, 102, 102)'
          }
        },
        autotick: false,
        dtick: 10,
        ticks: 'outside',
        tickcolor: 'rgb(102, 102, 102)'
      },
      margin: {
        l: 140,
        r: 40,
        b: 50,
        t: 80
      },
      legend: {
        font: {
          size: 10,
        },
        yanchor: 'middle',
        xanchor: 'right'
      },
      width: 640,
      height: 480,
      paper_bgcolor: 'rgb(254, 247, 234)',
      plot_bgcolor: 'rgb(254, 247, 234)',
      hovermode: 'closest'
    }
  };


}

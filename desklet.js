
/*
Created: Oct 2022
Name: Time And Date With TZ Cinnamon Desklet
Author: Alexandr Sokolov <alexandrsokolov@cock.li>
Version: 0.1
*/


const Gio = imports.gi.Gio;
const St = imports.gi.St;

const Desklet = imports.ui.desklet;

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const Settings = imports.ui.settings;

const UUID = "digital-tz-clock@sokol";


function MyDesklet(metadata, desklet_id){
    this._init(metadata, desklet_id);
}


MyDesklet.prototype = {
    __proto__: Desklet.Desklet.prototype,

    _init: function(metadata, desklet_id){
        Desklet.Desklet.prototype._init.call(this, metadata);
        
        this._time_format = {"hour": "2-digit", "minute": "2-digit"};
        this._date_format = {};

        this._load_settings(desklet_id);
        this._setup_ui();
        this.on_setting_changed();

        this._update_date();
    },

    _load_settings: function(desklet_id) {
        this.settings = new Settings.DeskletSettings(this, this.metadata["uuid"], desklet_id);
        this.settings.bindProperty(Settings.BindingDirection.IN, "time_size", "__time_size", this.on_setting_changed);
        this.settings.bindProperty(Settings.BindingDirection.IN, "date_size", "__date_size", this.on_setting_changed);
        this.settings.bindProperty(Settings.BindingDirection.IN, "time_zone", "__time_zone", this.on_setting_changed);
        this.settings.bindProperty(Settings.BindingDirection.IN, "is_show_date", "__is_show_date", this.on_repaint_ui);
        this.settings.bindProperty(Settings.BindingDirection.IN, "is_show_tz", "__is_show_tz", this.on_repaint_ui);
        this.settings.bindProperty(Settings.BindingDirection.IN, "is_show_label", "__is_show_label", this.on_repaint_ui);
        this.settings.bindProperty(Settings.BindingDirection.IN, "label", "__label_text", this.on_setting_changed);
    },

    _setup_ui: function() {
        this._clockContainer = new St.BoxLayout({vertical:true, style_class: 'clock-container'});
        
        this._setup_time_conteiner();
        this._setup_tz_conteiner();
        this._setup_date_conteiner();
        this._setup_label_conteiner();

        this.setContent(this._clockContainer);
    },

    _setup_time_conteiner: function() {
        this._time = new St.Label();

        this._timeContainer =  new St.BoxLayout({vertical:false, style_class: 'time-container'});
        this._timeContainer.add(this._time);
        this._clockContainer.add(this._timeContainer, {x_fill: false, x_align: St.Align.MIDDLE});
    },

    _setup_tz_conteiner: function() {
        this._tz = new St.Label();
        
        if (this.__is_show_tz) {
            this._tzContainer =  new St.BoxLayout({vertical: false, style_class: 'tz-container'});
            this._tzContainer.add(this._tz);
            this._clockContainer.add(this._tzContainer, {x_fill: false, x_align: St.Align.MIDDLE});
        }
    },

    _setup_date_conteiner: function() {
        this._date = new St.Label();
        
        if (this.__is_show_date) {
            this._dateContainer =  new St.BoxLayout({vertical:false, style_class: 'date-container'});
            this._dateContainer.add(this._date);
            this._clockContainer.add(this._dateContainer, {x_fill: false, x_align: St.Align.MIDDLE});
        }
    },

    _setup_label_conteiner: function() {
        this._label = new St.Label();
        
        if (this.__is_show_label) {
            this._labelContainer =  new St.BoxLayout({vertical:false, style_class: 'label-container'});
            this._labelContainer.add(this._label);
            this._clockContainer.add(this._labelContainer, {x_fill: false, x_align: St.Align.MIDDLE});
        }
    },

    on_desklet_removed: function() {
        try {
            Mainloop.source_remove(this.timeout);
        } catch (error) {
            global.log("Error with on_desklet_removed: " + error);
        }
    },

    on_repaint_ui: function() {
        this._clockContainer.destroy();
        this._setup_ui();
        this.on_setting_changed();
    },

    on_setting_changed: function() {
        // https://html-shark.com/HTML/LanguageCodes.htm
        this._time_locale = undefined;

        this._date.style="font-size: " + this.__date_size + "pt";
        this._tz.style="font-size: " + this.__date_size + "pt";
        this._label.style="font-size: " + this.__date_size + "pt";
        this._time.style="font-size: " + this.__time_size + "pt";

        // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
        let time_zone = this.__time_zone || undefined;
        
        this._time_opts = this._time_format;
        this._time_opts['timeZone'] = time_zone;
        this._date_opts = this._date_format;
        this._date_opts['timeZone'] = time_zone;

        this._label.set_text(this.__label_text);

        global.log("on_setting_changed");
    },

    _update_date: function(){
        try {
            // let timeFormat = '%H:%M';
            // let dateFormat = '%A,%e %B';
            let displayDate = new Date();


            this._time.set_text(displayDate.toLocaleTimeString(this._time_locale, this._time_opts));
            this._date.set_text(displayDate.toLocaleDateString(this._time_locale, this._date_opts));
            this._tz.set_text(this.__time_zone || "Local time");
            this.timeout = Mainloop.timeout_add_seconds(1, Lang.bind(this, this._update_date));
        }
        catch (error) {
            this.timeout = Mainloop.timeout_add_seconds(10, Lang.bind(this, this._update_date));
            global.log("Error with _update_date: " + error);
        }
    }
}


function main(metadata, desklet_id){
    let desklet = new MyDesklet(metadata, desklet_id);
    return desklet;
}

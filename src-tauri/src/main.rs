// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs::File,
    io::{BufReader, Read},
    path::Path,
};

use tauri::Manager;
use window_shadows::set_shadow;
use zip::ZipArchive;

use base64;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn open_devtools(window: tauri::Window) {
    window.open_devtools();
}

#[tauri::command]
fn load_file(path: String) -> Result<(String, Vec<String>), String> {
    let zip_path = Path::new(&path);
    let zip_file = File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(BufReader::new(zip_file)).map_err(|e| e.to_string())?;
    let mut json_res = String::new();
    let mut img_vec_res = Vec::new();
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let file_name = file.name().to_string();

        if file_name == "project.json" {
            let mut buffer = String::new();
            file.read_to_string(&mut buffer)
                .map_err(|e| e.to_string())?;
            json_res = buffer;
        } else if file_name.ends_with(".png") {
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;
            img_vec_res.push((
                base64::encode(buffer),
                (&file_name[0..file_name.len() - 4]).parse::<u32>().unwrap(),
            ));
        }
    }
    img_vec_res.sort_by_key(|(_, i)| *i);
    let img_vec_res = img_vec_res.into_iter().map(|(v, _)| v).collect::<Vec<_>>();
    Ok((json_res, img_vec_res))
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            #[cfg(any(windows, target_os = "macos"))]
            set_shadow(window, true).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![open_devtools, load_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use std::{
    fs::{create_dir_all, File, OpenOptions},
    io::{BufReader, Read, Write},
    path::Path,
};

use tauri_plugin_dialog::DialogExt;
use zip::{write::FileOptions, ZipArchive, ZipWriter};

use base64;

use tauri::{command, AppHandle, Manager};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[command(rename_all = "snake_case")]
fn open_devtools(app: AppHandle) {
    app.get_webview_window("main").unwrap().open_devtools();
}

#[command(rename_all = "snake_case")]
fn rust_log(log: String) {
    println!("{}", log)
}

type DataFileT = (String, Vec<String>);

#[command(rename_all = "snake_case")]
fn save_file_new(
    app: AppHandle,
    layers: Vec<String>,
    meta_data: String,
) -> Result<Option<String>, String> {
    let path = app
        .dialog()
        .file()
        .set_title("名前を付けて保存")
        .add_filter("BanaHexel Projects", &["bhp"])
        .set_file_name("project.bhp")
        .blocking_save_file();
    let path = if let Some(s) = path {
        s.into_path().map_err(|e| e.to_string())?
    } else {
        return Ok(None);
    };

    let file = File::create(&path).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);

    let opts: FileOptions<'_, ()> =
        FileOptions::default().compression_method(zip::CompressionMethod::Stored);
    for (i, layer_base64) in layers.iter().enumerate() {
        // Base64デコード
        let image_data = base64::decode(layer_base64).map_err(|e| e.to_string())?;

        // ZIPエントリーを作成
        let filename = format!("{}.png", i);
        zip.start_file(filename, opts).map_err(|e| e.to_string())?;
        zip.write_all(&image_data).map_err(|e| e.to_string())?;
    }
    zip.start_file("project.json", opts)
        .map_err(|e| e.to_string())?;
    zip.write_all(meta_data.as_bytes())
        .map_err(|e| e.to_string())?;

    zip.finish().map_err(|e| e.to_string())?;

    let path_string = path.to_str().unwrap().to_string();

    Ok(Some(path_string))
}

#[command(rename_all = "snake_case")]
fn write_file_with_path(
    path: String,
    layers: Vec<String>,
    meta_data: String,
) -> Result<(), String> {
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(path)
        .map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);

    let opts: FileOptions<'_, ()> =
        FileOptions::default().compression_method(zip::CompressionMethod::Stored);
    for (i, layer_base64) in layers.iter().enumerate() {
        // Base64デコード
        let image_data = base64::decode(layer_base64).map_err(|e| e.to_string())?;

        // ZIPエントリーを作成
        let filename = format!("{}.png", i);
        zip.start_file(filename, opts).map_err(|e| e.to_string())?;
        zip.write_all(&image_data).map_err(|e| e.to_string())?;
    }
    zip.start_file("project.json", opts)
        .map_err(|e| e.to_string())?;
    zip.write_all(meta_data.as_bytes())
        .map_err(|e| e.to_string())?;

    zip.finish().map_err(|e| e.to_string())?;

    Ok(())
}

#[command(rename_all = "snake_case")]
fn open_file_from_path(path: String) -> Result<DataFileT, String> {
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

#[command(rename_all = "snake_case")]
fn open_file(app: AppHandle) -> Result<Option<(String, DataFileT)>, String> {
    let path = app
        .dialog()
        .file()
        .set_title("開く")
        .add_filter("BanaHexel Projects", &["bhp"])
        .blocking_pick_file();
    let path = if let Some(s) = path {
        s.into_path().map_err(|e| e.to_string())?
    } else {
        return Ok(None);
    };
    let path_string = path
        .to_str()
        .ok_or("Can't convert path to string".to_string())
        .unwrap()
        .to_string();
    let zip_file = File::open(&path).map_err(|e| e.to_string())?;
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
    Ok(Some((path_string, (json_res, img_vec_res))))
}

#[command(rename_all = "snake_case")]
fn write_user_data(dir: String, path: String, data: String) -> Result<(), String> {
    let path = Path::new(&path);
    create_dir_all(dir).map_err(|e| e.to_string())?;
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .open(path)
        .map_err(|e| e.to_string())?;
    file.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[command(rename_all = "snake_case")]
fn read_user_data(path: String) -> Result<String, String> {
    let path = Path::new(&path);
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut buffer = String::new();
    file.read_to_string(&mut buffer)
        .map_err(|e| e.to_string())?;
    Ok(buffer)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            rust_log,
            open_devtools,
            open_file_from_path,
            open_file,
            save_file_new,
            write_file_with_path,
            write_user_data,
            read_user_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

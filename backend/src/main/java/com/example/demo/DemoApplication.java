package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(DemoApplication.class, args);
	}

	private static void loadDotEnv() {
		File[] candidates = new File[]{
				new File(".env"),
				new File("../.env"),
				new File("../../.env")
		};

		for (File file : candidates) {
			if (file.exists() && file.isFile()) {
				try {
					List<String> lines = Files.readAllLines(file.toPath());
					for (String line : lines) {
						String trimmed = line.trim();
						if (!trimmed.isEmpty() && !trimmed.startsWith("#") && trimmed.contains("=")) {
							int eqIdx = trimmed.indexOf('=');
							String key = trimmed.substring(0, eqIdx).trim();
							String value = trimmed.substring(eqIdx + 1).trim();
							if ((value.startsWith("\"") && value.endsWith("\"")) ||
								(value.startsWith("'") && value.endsWith("'"))) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					System.out.println("[CineFlix] Loaded .env configuration from: " + file.getAbsolutePath());
					break;
				} catch (Exception e) {
					System.err.println("[CineFlix] Could not load .env: " + e.getMessage());
				}
			}
		}
	}
}

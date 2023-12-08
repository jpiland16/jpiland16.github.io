#!/usr/bin/python
import os, shutil, re, textwrap

HTML_TARGET_RE = re.compile("(\s*)<!-- TARGET FOR NON-TEMPLATE HTML INSERTION -->")

CSS_TARGET = "<!-- TARGET FOR NON-TEMPLATE CSS INSERTION -->"
JS_TARGET = "<!-- TARGET FOR NON-TEMPLATE JS INSERTION -->"

BUILD_DIR = "build"

def main():
    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    os.mkdir(BUILD_DIR)

    with open("src/index.html", "r") as file_name:
        index_html = file_name.read()

    index_lines = index_html.splitlines()

    indentation = 0
    match = None

    for line in index_lines:
        search = HTML_TARGET_RE.search(line)
        if search:
            indentation = len(search.group(1))
            match = search.group(0)

    if not match:
        raise ValueError("MATCH FOR TEMPLATE INSERTION NOT FOUND IN index.html")

    with open("src/home.html", "r") as file_name:
        home_html = file_name.read()

    with open(f"{BUILD_DIR}/index.html", "w") as file_name:
        file_name.write(index_html.replace(
            match, textwrap.indent(home_html, " " * indentation)))

    shutil.copytree("src/static", f"{BUILD_DIR}/static")

    for root, dirs, files in os.walk("src"):
        if 'static' in dirs:
            dirs.remove('static')
        if root == "src":
            continue
        # print(root, dirs, files)

        dir_name = root[len("src/"):] # drop the prefix
        print(f"Create directory {BUILD_DIR}/{dir_name}...")
        os.mkdir(f"{BUILD_DIR}/{dir_name}")

        js_file_names = []
        css_file_names = []

        # check for JS/CSS files first:
        for file_name in files:
            if file_name.endswith(".js"):
                print(f"Add JS file: {BUILD_DIR}/{dir_name}/{file_name}")
                js_file_names.append(file_name)
            if file_name.endswith(".css"):
                print(f"Add CSS file: {BUILD_DIR}/{dir_name}/{file_name}")
                css_file_names.append(file_name)

        js_replacement = "".join(
            [f'<script src="{file}"></script>' for file in js_file_names])
        css_replacement = "".join(
            [f'<link rel="stylesheet" href="{file}">' for file in css_file_names])

        for file_name in files:

            if file_name == "index.html":
                print(f"Create {BUILD_DIR}/{dir_name}/{file_name} from template...")
                with open(f"src/{dir_name}/{file_name}", "r") as file:
                    contents = file.read()
                with open(f"{BUILD_DIR}/{dir_name}/index.html", "w") as file:
                    file.write(index_html.replace(
                        match, textwrap.indent(contents, " " * indentation)
                    ).replace(CSS_TARGET, css_replacement)
                    .replace(JS_TARGET, js_replacement))
                    
            else:
                shutil.copyfile(f"{root}/{file_name}", 
                                f"{BUILD_DIR}/{dir_name}/{file_name}")

if __name__ == "__main__":
    main()

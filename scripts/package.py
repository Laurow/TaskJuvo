"""Package the tested static prototype without development dependencies."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parent.parent
site = root / "out"
if not (site / "index.html").is_file():
    raise SystemExit("Build the website first with npm run build.")

artifact_dir = root / "artifacts"
artifact_dir.mkdir(exist_ok=True)
artifact = artifact_dir / "TaskJuvo-prototype.zip"
prefix = "TaskJuvo-prototype/"
with ZipFile(artifact, "w", ZIP_DEFLATED) as archive:
    for path in sorted(site.rglob("*")):
        if path.is_file():
            archive.write(path, prefix + "out/" + path.relative_to(site).as_posix())
    for source, target in [
        ("scripts/serve.mjs", "start.mjs"),
        ("docs/START_HIER.md", "START_HERE.md"),
        ("docs/EXPERTREVIEW.md", "EXPERTREVIEW.md"),
        ("node_modules/@fontsource-variable/inter/LICENSE", "licenses/Inter.txt"),
        ("node_modules/lucide-react/LICENSE", "licenses/Lucide.txt"),
        ("node_modules/next/license.md", "licenses/Next.txt"),
        ("node_modules/react/LICENSE", "licenses/React.txt"),
        ("node_modules/react-dom/LICENSE", "licenses/ReactDOM.txt"),
    ]:
        archive.write(root / source, prefix + target)
    gallery = artifact_dir / "TaskJuvo-gallery.html"
    if gallery.is_file():
        archive.write(gallery, prefix + "gallery.html")
    capture_names = [
        "TaskJuvo-homepage.png",
        "TaskJuvo-overview.png",
        "TaskJuvo-task-wizard.png",
        "TaskJuvo-matches.png",
        "TaskJuvo-profile.png",
        "TaskJuvo-confirmation.png",
        "TaskJuvo-workspace.png",
        "TaskJuvo-talent.png",
        "TaskJuvo-feedback.png",
        "TaskJuvo-screen-overview.png",
        "TaskJuvo-pages.png",
        "TaskJuvo-mobile.png",
        "TaskJuvo-mobile-matches.png",
    ]
    for capture_name in capture_names:
        capture = artifact_dir / capture_name
        if capture.is_file():
            archive.write(capture, prefix + "screens/" + capture.name)

with ZipFile(artifact) as archive:
    if archive.testzip():
        raise SystemExit("Archive integrity check failed.")
    print(f"Packaged: {artifact.name} ({len(archive.namelist())} files, {artifact.stat().st_size:,} bytes)")

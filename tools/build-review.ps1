# Generate review copies with isolated save/UI/performance keys.
$taskReviewRoot = Split-Path -Parent $PSScriptRoot
$taskReviewUtf8 = [System.Text.UTF8Encoding]::new($false)
$taskReviewHtml = [System.IO.File]::ReadAllText((Join-Path $taskReviewRoot 'index.html'),$taskReviewUtf8)
$taskReviewHtml = $taskReviewHtml.Replace('bio-hunter-warden-v3','bio-hunter-art-review-save-v18.6.1').Replace('bio-hunter-ui-v2','bio-hunter-art-review-ui-v18.6.1').Replace('bio-hunter-pt-v1','bio-hunter-art-review-pt-v18.6.1')
[System.IO.File]::WriteAllText((Join-Path $taskReviewRoot 'index.art-review.html'),$taskReviewHtml,$taskReviewUtf8)
$taskReviewTouch = $taskReviewHtml.Replace('<script>' + "`n" + '(function () {','<script>window.ontouchstart = null;</script>' + "`n" + '<script>' + "`n" + '(function () {')
[System.IO.File]::WriteAllText((Join-Path $taskReviewRoot 'index.touch-review.html'),$taskReviewTouch,$taskReviewUtf8)

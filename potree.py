from subprocess import run
import os
import sys

import argparse
parser = argparse.ArgumentParser("potree pointcloud creator")
parser.add_argument("--url", help="The source url to download", type=str)
args = parser.parse_args()

url = args.url or 'http://kitti.is.tue.mpg.de/kitti/raw_data/2011_09_28_drive_0016/2011_09_28_drive_0016_sync.zip'

#curl = f"curl {url} -o ./raw.zip"
extract = 'unzip raw'
loop = [
    'cd 2011_09_28/2011_09_28_drive_0016_sync/velodyne_points/data;'
    'for i in *',
    'do',
    'echo "$i"',
    'PotreeConverter "$i"',
    'done'
]


convert = '\n'.join(loop)
#print(convert)

upload = 's3cmd put . s3://3d-testing -r'

if __name__ == "__main__":
    print('done')
    os.system(curl)
    os.system(extract)
    os.system(convert)
    os.system(upload)

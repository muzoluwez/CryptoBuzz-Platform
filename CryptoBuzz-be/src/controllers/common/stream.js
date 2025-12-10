import { streamClient } from "../../utils/constants.js";
import LiveStreamModel from "../../models/liveStream.js";


export const getToken = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send("User ID is required");

  try {
    const token = streamClient.generateUserToken(
      { user_id: userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      }
    );
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating token");
  }
};


export const createLiveStreamForSchedule = async (schedule) => {
  try {

    const callId = `${schedule.callId}`
      ? `${schedule.callId}`
      : `callId-${uuidv4()}`;

    const call = streamClient.video.call("livestream", callId);

    // base call create karo
    const response = await call.getOrCreate({
      data: {
        created_by_id: schedule.educator,
        members: [{ user_id: schedule.educator, role: "admin" }],
        settings_override: {
          audio: { mic_default_on: true, default_device: "speaker" },
          broadcast: {
            hls: { enabled: true, auto_start: true },
          },
          limits: { max_duration_seconds: 18000 },
          recording: {
            mode: "available",
            audio_only: false,
            quality: "1080p",
            layout: {
              name: "single-participant",
              options: {
                "layout.single-participant.padding_inline": "0%",
                "layout.single-participant.padding_block": "0%",
                "video.scale_mode": "fill",
                "video.screenshare_scale_mode": "fill",
                "participant.aspect_ratio": "16/9",
                "layout.background_color": "#000000",
              },
            },
          },
        },
        custom: {
          title: schedule.title,
          description: schedule.description,
          category: schedule.category,
          tags: schedule.tags,
          thumbnail: schedule.image,
        },
      },
    });

    // RTMP details nikaalo
    let rtmp_URl = response?.call?.ingress?.rtmp?.address || null;

    // stable token generate karo (1 year valid)
    const token = streamClient.generateUserToken({
      user_id: schedule.educator,
      validity_in_seconds: 31536000,
      video: {
        livestream: [
          "JoinCall",
          "CreateCall",
          "StartRecording",
          "StopRecording",
          "ListRecordings",
        ],
      },
    });

    //Base stream record save karo
    const newScheduleEntry = await LiveStreamModel.create({
      title: schedule.title,
      datetime: schedule.datetime,
      educator: schedule.educator,
      schedule: schedule._id,
      callId,
      token,
      rtmp_URl,
    });
    // }

    // // 2. Har baar nayi schedule entry create karo (not update)
    // const newScheduleEntry = await LiveStreamModel.create({
    //   title: schedule.title,
    //   educator: schedule.educator,
    //   datetime: schedule.datetime,
    //   callId, // same callId
    //   token, // same token
    //   rtmp_URl, // same RTMP URL
    //   flag: false, // ye schedule record hai
    // });

    // 3. Agar schedule model bhi hai → usko update kar do
    schedule.generateToken = true;
    schedule.callId = callId;
    schedule.status = "pending";
    schedule.liveStreamId = newScheduleEntry?._id || null;

    await schedule.save();

    return {
      success: true,
      message: "New schedule created with same RTMP and token",
      schedule: newScheduleEntry,
    };
  } catch (err) {
    console.error("❌ Error creating livestream:", err.message);
    return { success: false, message: err.message };
  }
};

export const updateLiveStreamForSchedule = async (schedule) => {
  try {
    // agar base stream nahi mili to naya base stream create karo
    const callId = `${schedule.callId}`
      ? `${schedule.callId}`
      : `callId-${uuidv4()}`;
    const call = streamClient.video.call("livestream", callId);

    const response = await call.getOrCreate({
      data: {
        created_by_id: schedule.educator,
        members: [
          {
            user_id: schedule.educator,
            role: "admin",
          },
        ],
        settings_override: {
          audio: { mic_default_on: true, default_device: "speaker" },
          broadcast: {
            hls: { enabled: true, auto_start: true },
          },
          limits: { max_duration_seconds: 18000 },
          recording: {
            mode: "available",
            audio_only: false,
            quality: "1080p",
            layout: {
              name: "single-participant",
              options: {
                "layout.single-participant.padding_inline": "0%",
                "layout.single-participant.padding_block": "0%",
                "video.scale_mode": "fill",
                "video.screenshare_scale_mode": "fill",
                "participant.aspect_ratio": "16/9",
                "layout.background_color": "#000000",
              },
            },
          },
        },
        custom: {
          title: schedule.title,
          description: schedule.description,
          category: schedule.category,
          tags: schedule.tags,
          thumbnail: schedule.image,
        },
      },
    });

    let rtmp_URl = response?.call?.ingress?.rtmp?.address || null;

    let token = streamClient.generateUserToken({
      user_id: schedule.educator,
      validity_in_seconds: 31536000,
      video: {
        livestream: [
          "JoinCall",
          "CreateCall",
          "StartRecording",
          "StopRecording",
          "ListRecordings",
        ],
      },
    });

    // 2. Schedule ka existing record check karo
    let existingSchedule = await LiveStreamModel.findOne({
      callId: schedule.callId,
    });

    if (existingSchedule) {
      // agar record mila → usko update karo
      existingSchedule.title = schedule.title;
      existingSchedule.educator = schedule.educator;
      existingSchedule.datetime = schedule.datetime;
      existingSchedule.callId = schedule.callId ? schedule.callId : callId;
      existingSchedule.token = token;
      existingSchedule.rtmp_URl = rtmp_URl;

      await existingSchedule.save();
    }
    // } else {
    //   // agar nahi mila → fallback me new record create karo
    //   existingSchedule = await LiveStreamModel.create({
    //     title: schedule.title,
    //     educator: schedule.educator,
    //     datetime: schedule.datetime,
    //     callId,
    //     token,
    //     rtmp_URl,
    //   });
    // }

    // 3. Schedule model ko update karo
    // schedule.callId = callId;
    schedule.status = "pending";
    // schedule.liveStreamId = existingSchedule?._id;

    await schedule.save();

    return {
      success: true,
      message: "Schedule updated successfully",
      schedule: existingSchedule,
    };
  } catch (err) {
    console.error("❌ Error updating livestream:", err.message);
    return { success: false, message: err.message };
  }
};


export default { updateLiveStreamForSchedule, createLiveStreamForSchedule, getToken }